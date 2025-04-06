use crate::{admin_check, constant::*, error::ChauError, state::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Ban<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub bettor: SystemAccount<'info>,

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
        mut,
        seeds = [BETTOR_PROFILE,bettor.key().to_bytes().as_ref(),chau_config.key().to_bytes().as_ref()],
        bump = betror_profile.bettor_bump,

    )]
    pub betror_profile: Account<'info, Bettor>,

    pub system_program: Program<'info, System>,
}

impl<'info> Ban<'info> {
    pub fn ban_bettor(&mut self) -> Result<()> {
        admin_check!(self);

        self.betror_profile.is_ban = true;

        Ok(())
    }
}
