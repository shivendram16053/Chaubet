use anchor_lang::prelude::*;

use crate::{
    constant::{CHAU_CONFIG, TREASURY},
    error::ChauError,
    state::*,
};

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init_if_needed,
        payer = admin,
        space = ChauConfig::DISCRIMINATOR.len() + ChauConfig::INIT_SPACE,
        seeds = [CHAU_CONFIG],
        bump
    )]
    pub chau_config: Account<'info, ChauConfig>,

    #[account(
        seeds = [TREASURY,chau_config.key().to_bytes().as_ref()],
        bump
    )]
    pub treasury_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeConfig<'info> {
    pub fn init_config(&mut self, bumps: InitializeConfigBumps, fees: u16) -> Result<()> {
        // Checks for more the two admins
        require!(self.chau_config.admin.len() < 3, ChauError::ToManyAdmins);

        let admin_check = self
            .chau_config
            .admin
            .iter()
            .any(|admin_pubkey| admin_pubkey == self.admin.key);

        // Check if admin already exist
        require!(!admin_check, ChauError::AdminExist);

        self.chau_config.fees = fees;
        self.chau_config.trasury_bump = bumps.treasury_account;
        self.chau_config.config_bump = bumps.chau_config;
        self.chau_config.admin.push(self.admin.key());
        self.chau_config.treasuty_amount = 0;

        Ok(())
    }
}
