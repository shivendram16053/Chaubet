use anchor_lang::{
    prelude::*,
    solana_program::native_token::LAMPORTS_PER_SOL,
    system_program::{transfer, Transfer},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{mint_to_checked, Mint, MintToChecked, TokenAccount, TokenInterface},
};

use rust_decimal::prelude::{Decimal, *};

use crate::{check_ban, check_zero, constant::*, decimal_convo, error::ChauError, state::*};

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        seeds = [BETTOR_PROFILE,bettor.key().to_bytes().as_ref(),chau_config.key().to_bytes().as_ref()],
        bump = bettor_profile.bettor_bump,

        constraint = bettor_profile.bettor_pubkey == bettor.key() @ ChauError::InvalidAccount
    )]
    pub bettor_profile: Account<'info, Bettor>,

    #[account(
        init_if_needed,
        payer = bettor,
        space = Wager::DISCRIMINATOR.len() + Wager::INIT_SPACE,
        seeds = [WAGER,chau_market.key().to_bytes().as_ref(),bettor.key().to_bytes().as_ref()],
        bump
    )]
    pub wager_account: Account<'info, Wager>,

    #[account(
        mut,
        seeds = [BETTOR_WALLET,bettor.key().to_bytes().as_ref(), chau_config.key().to_bytes().as_ref()],
        bump = bettor_profile.bettor_vault_bump
    )]
    pub bettor_wallet_account: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [CHAU_CONFIG],
        bump = chau_config.config_bump
    )]
    pub chau_config: Account<'info, ChauConfig>,

    #[account(
        mut,
        seeds = [MARKET, chau_config.key().to_bytes().as_ref(),&chau_market.market_name.as_bytes()[..32]],
        bump = chau_market.market_bump
    )]
    pub chau_market: Account<'info, ChauMarket>,

    #[account(
        mut,
        seeds = [MINT_YES,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.mint_yes_bump,
        mint::authority = chau_config,
    )]
    pub mint_yes: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [MINT_NO,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.mint_no_bump,
        mint::authority = chau_config,
    )]
    pub mint_no: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [MARKET_VAULT,chau_market.key().to_bytes().as_ref()],
        bump  = chau_market.market_vault_bump
    )]
    pub market_vault_account: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = bettor,
        associated_token::authority = bettor,
        associated_token::mint = mint_yes
    )]
    pub bettor_yes_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = bettor,
        associated_token::authority = bettor,
        associated_token::mint = mint_no
    )]
    pub bettor_no_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> BuyShares<'info> {
    pub fn buy_shares(
        &mut self,
        bumps: BuySharesBumps,
        shares_amount: u64,
        is_yes: bool,
    ) -> Result<()> {
        check_ban!(self.bettor_profile.is_ban);

        match self.chau_market.market_state {
            MarketStatus::Active => {
                // save data
                if !self.wager_account.is_initialized {
                    self.wager_account.set_inner(Wager {
                        bettor_pubkey: self.bettor.key(),
                        market_pubkey: self.chau_market.key(),
                        bet_amount_spent: 0,
                        bet_amount_earned: 0,
                        market_status: self.chau_market.market_state,
                        market_outcome: MarketOutcome::NotResolved,
                        yes_shares: 0,
                        no_shares: 0,
                        is_initialized: true,
                        bet_bump: bumps.wager_account,
                    });
                }

                check_zero!([decimal_convo!(shares_amount)]);

                // calculate the cost of given shares_amount
                let share_cost = match is_yes {
                    true => self
                        .chau_market
                        .share_calculation(true, shares_amount, 0, self.chau_config.fees)?
                        .to_u64()
                        .ok_or(ChauError::ArthemeticError)?,

                    false => self
                        .chau_market
                        .share_calculation(true, 0, shares_amount, self.chau_config.fees)?
                        .to_u64()
                        .ok_or(ChauError::ArthemeticError)?,
                };

                self.deposite_wager(share_cost)?;
                self.send_shares(shares_amount, is_yes)?;
                self.update_all_state(shares_amount, share_cost, is_yes)?;
            }
            MarketStatus::Resolved => {
                return Err(error!(ChauError::MarketGotResolved));
            }
        }

        Ok(())
    }

    fn deposite_wager(&mut self, amount: u64) -> Result<()> {
        // transfer wager amount from bettor wallet to vault Accounts

        require!(
            self.bettor_wallet_account.lamports() >= amount * LAMPORTS_PER_SOL,
            ChauError::NotEnoughAmount
        );

        let accounts = Transfer {
            from: self.bettor_wallet_account.to_account_info(),
            to: self.market_vault_account.to_account_info(),
        };

        let bettor_seeds = self.bettor.key().to_bytes();
        let chau_config_seeds = self.chau_config.key().to_bytes();
        let seeds = &[
            BETTOR_WALLET,
            bettor_seeds.as_ref(),
            chau_config_seeds.as_ref(),
            &[self.bettor_profile.bettor_vault_bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        transfer(ctx, amount * LAMPORTS_PER_SOL)?;
        Ok(())
    }

    fn send_shares(&mut self, share_amount: u64, is_yes: bool) -> Result<()> {
        // trasnfer shares to bettor token Accounts

        let (to, mint) = match is_yes {
            true => (&self.bettor_yes_account, &self.mint_yes),
            false => (&self.bettor_no_account, &self.mint_no),
        };

        let accounts = MintToChecked {
            to: to.to_account_info(),
            authority: self.chau_config.to_account_info(),
            mint: mint.to_account_info(),
        };

        let seeds = &[CHAU_CONFIG, &[self.chau_config.config_bump]];
        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        mint_to_checked(ctx, share_amount, mint.decimals)?;
        Ok(())
    }

    fn update_all_state(&mut self, share_amount: u64, bet_amount: u64, is_yes: bool) -> Result<()> {
        // update after transfering shars to bettor_pubkey

        if is_yes {
            // update the bet account
            self.wager_account
                .yes_shares
                .checked_add(share_amount)
                .ok_or(ChauError::ArthemeticOverflow)?;

            // update the market account
            self.chau_market
                .outcome_yes_shares
                .checked_add(share_amount)
                .ok_or(ChauError::ArthemeticOverflow)?;
        } else {
            // update the bet account
            self.wager_account
                .no_shares
                .checked_add(share_amount)
                .ok_or(ChauError::ArthemeticOverflow)?;

            // update the market account
            self.chau_market
                .outcome_no_shares
                .checked_add(share_amount)
                .ok_or(ChauError::ArthemeticOverflow)?;
        }

        self.wager_account
            .bet_amount_spent
            .checked_add(bet_amount)
            .unwrap();

        Ok(())
    }
}
