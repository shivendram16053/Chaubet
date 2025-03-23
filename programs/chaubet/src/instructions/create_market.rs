use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::{
    constant::{CHAU_CONFIG, MARKET, MINT_NO, MINT_YES},
    state::{ChauConfig, ChauMarket, MarketStatus},
    utils::helper::MarketArg,
};

// Accounts
// - admin(signer)
// - mint_yes
// - mint_no
// - chau_market
// - chau_config

#[derive(Accounts)]
#[instruction(name:String)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [CHAU_CONFIG],
        bump = chau_config.config_bump
    )]
    pub chau_config: Account<'info, ChauConfig>,

    #[account(
        init,
        payer = admin,
        space = 8 + ChauMarket::INIT_SPACE,
        seeds = [MARKET, chau_config.key().to_bytes().as_ref(),name.as_bytes()],
        bump
    )]
    pub chau_market: Account<'info, ChauMarket>,

    #[account(
        init,
        payer = admin,
        seeds = [MINT_YES,chau_market.key().to_bytes().as_ref(), name.as_bytes()],
        bump,
        mint::authority = chau_config,
        mint::decimals = 0
    )]
    pub mint_yes: InterfaceAccount<'info, Mint>,

    #[account(
            init,
            payer = admin,
            seeds = [MINT_NO,chau_market.key().to_bytes().as_ref(), name.as_bytes()],
            bump,
            mint::authority = chau_config,
            mint::decimals = 0
        )]
    pub mint_no: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> CreateMarket<'info> {
    pub fn save_market_data(&mut self, bump: CreateMarketBumps, arg: MarketArg) -> Result<()> {
        self.chau_market.set_inner(ChauMarket {
            market_name: arg.name,
            description: arg.description,
            lsmr_b: arg.lmsr_b,
            dead_line: arg.dead_line,
            market_state: MarketStatus::Active,
            locked_bool: true,
            mint_yes_shares: 0,
            mint_no_shares: 0,
            mint_yes_bump: bump.mint_yes,
            mint_no_bump: bump.mint_no,
            market_bump: bump.chau_market,
        });
        Ok(())
    }
}
