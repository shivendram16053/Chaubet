use crate::{
    constant::*,
    state::{Bet, ChauConfig, ChauMarket},
};
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

#[derive(Accounts)]
pub struct SellShares<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        seeds = [BETTOR_WALLET,bettor.key().to_bytes().as_ref(), chau_config.key().to_bytes().as_ref()],
        bump
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
        seeds = [MARKET,chau_config.key().to_bytes().as_ref()],
        bump = chau_market.market_bump
    )]
    pub chau_market: Account<'info, ChauMarket>,

    #[account(
        mut,
        seeds = [BET,chau_market.key().to_bytes().as_ref()],
        bump = bet_account.bet_bump,
    )]
    pub bet_account: Account<'info, Bet>,

    #[account(
        mut,
        seeds = [MINT_YES,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.mint_yes_bump,
    )]
    pub mint_yes: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [MINT_NO,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.mint_no_bump,
    )]
    pub mint_no: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::authority = bettor,
        associated_token::mint = mint_yes,
        associated_token::token_program = token_program
    )]
    pub bettor_yes_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_no,
        associated_token::authority = bettor,
        associated_token::token_program = token_program,
    )]
    pub bettor_no_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [MARKET_VAULT,chau_config.key().to_bytes().as_ref()],
        bump
    )]
    pub market_vault_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> SellShares<'info> {
    // The flow is burn the given tokens and transder the sol to bettor
    pub fn sell_shares(&mut self, shares_amount: u64, is_yes: bool) -> Result<()> {
        // calculate the amount of sol and save the data
        let sol_amount = match is_yes {
            true => self
                .chau_market
                .share_calculation(false, shares_amount, 0, self.chau_config.fees)?
                .to_u64()
                .unwrap(),
            false => self
                .chau_market
                .share_calculation(false, 0, shares_amount, self.chau_config.fees)?
                .to_u64()
                .unwrap(),
        };

        self.burn_shares(shares_amount, is_yes)?;
        self.transfer_sol(sol_amount)?;
        self.update_state(shares_amount, is_yes)?;

        Ok(())
    }

    fn burn_shares(&mut self, outcome_token_amount: u64, is_yes: bool) -> Result<()> {
        // burn the given share amount_sol

        let (mint, from) = match is_yes {
            true => (&self.mint_yes, &self.bettor_yes_ata),
            false => (&self.mint_no, &self.bettor_no_ata),
        };

        let ctx = CpiContext::new(
            self.token_program.to_account_info(),
            BurnChecked {
                mint: mint.to_account_info(),
                authority: self.bettor.to_account_info(),
                from: from.to_account_info(),
            },
        );

        burn_checked(ctx, outcome_token_amount, mint.decimals)?;
        Ok(())
    }

    fn transfer_sol(&mut self, amount_sol: u64) -> Result<()> {
        // transfer the sol amount from market vault account to bettor wallet account

        let accounts = Transfer {
            from: self.market_vault_account.to_account_info(),
            to: self.bettor_wallet_account.to_account_info(),
        };

        let chau_config_seed = self.chau_config.key().to_bytes();
        let seeds = &[
            MARKET_VAULT,
            chau_config_seed.as_ref(),
            &[self.chau_market.market_vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        transfer(ctx, amount_sol * LAMPORTS_PER_SOL)?;

        Ok(())
    }

    fn update_state(&mut self, shares_amount: u64, is_yes: bool) -> Result<()> {
        // update the bet account

        // update market account
        if is_yes {
            self.chau_market
                .outcome_yes_shares
                .checked_sub(shares_amount)
                .unwrap();
        } else {
            self.chau_market
                .outcome_no_shares
                .checked_sub(shares_amount)
                .unwrap();
        }

        Ok(())
    }
}
