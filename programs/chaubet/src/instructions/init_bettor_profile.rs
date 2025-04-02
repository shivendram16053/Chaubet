use anchor_lang::{
    prelude::*,
    solana_program::native_token::LAMPORTS_PER_SOL,
    system_program::{transfer, Transfer},
    Result,
};
use rust_decimal::Decimal;

use crate::{
    check_zero,
    constant::{BETTOR, BETTOR_WALLET, CHAU_CONFIG},
    error::ChauError,
    state::{Bettor, ChauConfig},
};

#[derive(Accounts)]
pub struct InitializeBettor<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
     mut,
     seeds = [CHAU_CONFIG],
     bump = chau_config.config_bump
    )]
    pub chau_config: Account<'info, ChauConfig>,

    #[account(
        init,
        payer = bettor,
        space = 8 + Bettor::INIT_SPACE,
        seeds = [BETTOR,bettor.key().to_bytes().as_ref(),chau_config.key().to_bytes().as_ref()],
        bump
    )]
    pub bettor_profile: Account<'info, Bettor>,

    #[account(
        mut,
        seeds = [BETTOR_WALLET,bettor.key().to_bytes().as_ref(), chau_config.key().to_bytes().as_ref()],
        bump
    )]
    pub bettor_wallet_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeBettor<'info> {
    pub fn init_bettor(
        &mut self,
        name: Option<String>,
        amount_deposite: u64,
        bumps: InitializeBettorBumps,
    ) -> Result<()> {
        // save the user data
        // transfer bettor fundes to program Accounts

        self.bettor_profile.set_inner(Bettor {
            bettor_pubkey: self.bettor.key(),
            bettor_name: name,
            bettor_net_profit: 0,
            balance: 0,
            is_ban: false,
            bettor_vault_bump: bumps.bettor_wallet_account,
            bettor_bump: bumps.bettor_profile,
        });

        self.transfer_bettor_funds(amount_deposite)?;

        Ok(())
    }

    fn transfer_bettor_funds(&mut self, amount_deposite: u64) -> Result<()> {
        // transer bettor funds to chua_wallet

        check_zero!([Decimal::from(amount_deposite)]);

        let accounts = Transfer {
            from: self.bettor.to_account_info(),
            to: self.bettor_wallet_account.to_account_info(),
        };

        let bettor_seed = self.bettor.key().to_bytes();
        let chau_config = self.chau_config.key().to_bytes();

        let seeds = &[BETTOR_WALLET, bettor_seed.as_ref(), chau_config.as_ref()];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        transfer(ctx, amount_deposite * LAMPORTS_PER_SOL)?;

        // update the bettor balance
        self.bettor_profile
            .balance
            .checked_add(amount_deposite)
            .unwrap();
        Ok(())
    }
}
