use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::{admin_check, constant::*, error::*, state::*};

#[derive(Accounts)]
pub struct AdminWithdraw<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [CHAU_CONFIG],
        bump = chau_config.config_bump
    )]
    pub chau_config: Account<'info, ChauConfig>,

    #[account(
        mut,
        seeds = [MARKET,chau_config.key().to_bytes().as_ref(),chau_market.market_name.as_bytes()],
        bump = chau_market.market_bump
    )]
    pub chau_market: Account<'info, ChauMarket>,

    #[account(
        seeds = [MARKET_VAULT,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.market_vault_bump
    )]
    pub market_vault_account: SystemAccount<'info>, // Where bettor desposites there wagers

    #[account(
        seeds = [TREASURY,chau_config.key().to_bytes().as_ref()],
        bump = chau_config.trasury_bump
    )]
    pub treasury_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> AdminWithdraw<'info> {
    pub fn admin_withdraw_revenue(&mut self) -> Result<()> {
        admin_check!(self);

        let accounts = Transfer {
            from: self.market_vault_account.to_account_info(),
            to: self.treasury_account.to_account_info(),
        };

        let chau_config_seed = self.chau_market.key().to_bytes();
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

        transfer(ctx, self.market_vault_account.lamports())?;

        Ok(())
    }
}
