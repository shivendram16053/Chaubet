use anchor_lang::prelude::*;

use crate::{
    admin_check,
    constant::*,
    error::ChauError,
    state::*,
    utils::{MarketOutcome, MarketStatus},
};

#[derive(Accounts)]
pub struct Resolve<'info> {
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
        seeds = [MARKET, chau_config.key().to_bytes().as_ref(),&chau_market.market_name.as_bytes()[..32]],
        bump = chau_market.market_bump
    )]
    pub chau_market: Account<'info, ChauMarket>,
}

impl<'info> Resolve<'info> {
    pub fn resolve_market(&mut self, outcome: MarketOutcome) -> Result<()> {
        admin_check!(self);

        require!(
            Clock::get()?.unix_timestamp >= self.chau_market.dead_line,
            ChauError::MarketNotResolved
        );

        match self.chau_market.market_state {
            MarketStatus::Active => match outcome {
                MarketOutcome::YES => {
                    self.chau_market.market_outcome = MarketOutcome::YES;
                    self.chau_market.market_state = MarketStatus::Resolved;
                }
                MarketOutcome::NO => {
                    self.chau_market.market_outcome = MarketOutcome::YES;
                    self.chau_market.market_state = MarketStatus::Resolved;
                }
                MarketOutcome::NotResolved => {}
            },
            MarketStatus::Resolved => {
                return err!(ChauError::MarketGotResolved);
            }
        }

        Ok(())
    }
}
