use anchor_lang::{
    prelude::*,
    solana_program::native_token::LAMPORTS_PER_SOL,
    system_program::{transfer, Transfer},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{burn_checked, BurnChecked, Mint, TokenAccount, TokenInterface},
};

use rust_decimal::prelude::*;

use crate::{check_ban, check_zero, constant::*, decimal_convo, error::*, state::*};

#[derive(Accounts)]
pub struct ClaimAmount<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        seeds = [WAGER,chau_market.key().to_bytes().as_ref(),bettor.key().to_bytes().as_ref()],
        bump = wager_account.bet_bump,

    )]
    pub wager_account: Account<'info, Wager>,

    #[account(
        mut,
        seeds = [BETTOR_PROFILE,bettor.key().to_bytes().as_ref(),chau_config.key().to_bytes().as_ref()],
        bump = bettor_profile.bettor_bump,
        constraint = bettor_profile.bettor_pubkey == bettor.key() @ ChauError::InvalidAccount
    )]
    pub bettor_profile: Account<'info, Bettor>,

    #[account(
        mut,
        seeds = [BETTOR_WALLET,bettor.key().to_bytes().as_ref(), chau_config.key().to_bytes().as_ref()],
        bump = bettor_profile.bettor_vault_bump
     )]
    pub bettor_wallet_account: SystemAccount<'info>,

    #[account(
        mut,
        associated_token::mint = mint_yes,
        associated_token::authority = bettor,
    )]
    pub bettor_yes_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint_no,
        associated_token::authority = bettor,
    )]
    pub bettor_no_ata: InterfaceAccount<'info, TokenAccount>,

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
        seeds = [MARKET_VAULT,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.market_vault_bump
    )]
    pub market_vault_account: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [MINT_YES,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.mint_yes_bump,
        mint::token_program = token_program,
        mint::authority = chau_config
    )]
    pub mint_yes: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [MINT_NO,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.mint_no_bump,
        mint::token_program = token_program,
        mint::authority = chau_config
    )]
    pub mint_no: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> ClaimAmount<'info> {
    pub fn claim_amount(&mut self, shares_amount: u64) -> Result<()> {
        check_zero!([decimal_convo!(shares_amount)]);

        check_ban!(self.bettor_profile.is_ban);
        match self.chau_market.market_state {
            MarketStatus::Resolved => match self.chau_market.market_outcome {
                MarketOutcome::YES => {
                    require!(
                        self.bettor_yes_ata.amount >= shares_amount,
                        ChauError::NotEnoughShares
                    );

                    self.reward_bettor(shares_amount)?;
                    self.burn_outcome_shares(shares_amount, true)?;
                    self.update_state(shares_amount)?;
                }
                MarketOutcome::NO => {
                    require!(
                        self.bettor_no_ata.amount >= shares_amount,
                        ChauError::NotEnoughShares
                    );

                    self.reward_bettor(shares_amount)?;
                    self.burn_outcome_shares(shares_amount, false)?;
                    self.update_state(shares_amount)?;
                }

                MarketOutcome::NotResolved => {
                    return err!(ChauError::MarketNotResolved);
                }
            },
            MarketStatus::Active => {
                return err!(ChauError::MarketNotResolved);
            }
        }

        Ok(())
    }

    fn reward_bettor(&mut self, sol_amount: u64) -> Result<()> {
        // transfer reward from market vault to bettor_wallet_account

        let market_seed = self.chau_market.key().to_bytes();

        let seeds = &[
            MARKET_VAULT,
            market_seed.as_ref(),
            &[self.chau_market.market_vault_bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            Transfer {
                from: self.market_vault_account.to_account_info(),
                to: self.bettor_wallet_account.to_account_info(),
            },
            signer_seeds,
        );

        transfer(ctx, sol_amount * LAMPORTS_PER_SOL)?;

        Ok(())
    }

    fn burn_outcome_shares(&mut self, shares_amount: u64, is_yes: bool) -> Result<()> {
        let (from, mint) = match is_yes {
            true => (&self.bettor_yes_ata, &self.mint_yes),
            false => (&self.bettor_no_ata, &self.mint_no),
        };

        let account = BurnChecked {
            from: from.to_account_info(),
            authority: self.bettor.to_account_info(),
            mint: mint.to_account_info(),
        };

        let ctx = CpiContext::new(self.token_program.to_account_info(), account);

        burn_checked(ctx, shares_amount, mint.decimals)?;

        Ok(())
    }

    fn update_state(&mut self, shares_amount: u64) -> Result<()> {
        // update the fucking states
        // - needed wager_account
        // - bettor_profile
        //
        // profite/loss = Winning Shares - [TotalSpent - Total Earned];

        let net_spent = self.wager_account.bet_amount_spent as i64
            - self.wager_account.bet_amount_earned as i64;

        let profit_loss = shares_amount as i64 - net_spent;

        // Update the bettor profile net profit
        self.bettor_profile.bettor_net_profit = self
            .bettor_profile
            .bettor_net_profit
            .checked_add(profit_loss)
            .ok_or(ChauError::ArthemeticError)?;

        Ok(())
    }
}
