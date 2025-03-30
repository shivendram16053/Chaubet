use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::{
    constant::{CHAU_CONFIG, MARKET, MARKET_VAULT, MINIMUM_LMSR_B, MINT_NO, MINT_YES},
    error::ChauError,
    state::{ChauConfig, ChauMarket, MarketStatus},
    utils::helper::MarketArg,
};

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
        space = ChauMarket::DISCRIMINATOR.len() + ChauMarket::INIT_SPACE,
        seeds = [MARKET, chau_config.key().to_bytes().as_ref(),name.as_bytes()],
        bump
    )]
    pub chau_market: Account<'info, ChauMarket>,

    #[account(
        init,
        payer = admin,
        seeds = [MINT_YES,chau_market.key().to_bytes().as_ref()],
        bump,
        mint::authority = chau_config,
        mint::decimals = 0
    )]
    pub mint_yes: InterfaceAccount<'info, Mint>,

    #[account(
            init,
            payer = admin,
            seeds = [MINT_NO,chau_market.key().to_bytes().as_ref()],
            bump,
            mint::authority = chau_config,
            mint::decimals = 0
        )]
    pub mint_no: InterfaceAccount<'info, Mint>,

    #[account(
        seeds = [MARKET_VAULT,chau_config.key().to_bytes().as_ref()],
        bump
    )]
    pub market_vault_account: SystemAccount<'info>, // Where bettor desposites there wagers

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> CreateMarket<'info> {
    pub fn save_market_data(&mut self, bump: CreateMarketBumps, arg: MarketArg) -> Result<()> {
        let check_admin = self
            .chau_config
            .admin
            .iter()
            .any(|admin_pubkey| self.admin.key() == *admin_pubkey);

        // Check: Only authrized can create markets
        require!(check_admin, ChauError::UnAuthourized);

        // Check: The Liquidity Parameter should pass the minimum threshold
        require_gte!(arg.lmsr_b, MINIMUM_LMSR_B, ChauError::ParameterTooLow);

        self.chau_market.set_inner(ChauMarket {
            market_name: arg.name,
            description: arg.description,
            lsmr_b: arg.lmsr_b,
            dead_line: arg.dead_line,
            market_state: MarketStatus::Active,
            is_locked: true,
            mint_yes_shares: 0,
            mint_no_shares: 0,
            mint_yes_bump: bump.mint_yes,
            mint_no_bump: bump.mint_no,
            market_vault_bump: bump.market_vault_account,
            market_bump: bump.chau_market,
        });
        Ok(())
    }
}
