use anchor_lang::prelude::*;

declare_id!("8PXHZ4Y6noy89qMEVBhGgeLGFuMzkP1QXFwBTAsRD2Hd");
pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

// - Implement Parlay betting feauture

#[program]
pub mod chaubet {

    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, fees: Option<u16>) -> Result<()> {
        ctx.accounts.init_config(ctx.bumps, fees)?;
        Ok(())
    }

    pub fn initialize_bettor_account(
        ctx: Context<InitializeBettor>,
        amount_deposited: u64,
        name: Option<String>,
    ) -> Result<()> {
        ctx.accounts
            .init_bettor(name, amount_deposited, ctx.bumps)?;

        Ok(())
    }

    pub fn create_market(ctx: Context<CreateMarket>, arg: MarketArg) -> Result<()> {
        ctx.accounts.save_market_data(ctx.bumps, arg)?;
        Ok(())
    }

    pub fn buy_shares(ctx: Context<BuyShares>, shares_amount: u64, is_yes: bool) -> Result<()> {
        ctx.accounts.buy_shares(ctx.bumps, shares_amount, is_yes)?;
        Ok(())
    }

    pub fn sell_shares(ctx: Context<SellShares>, shares_amount: u64, is_yes: bool) -> Result<()> {
        // Take expected amount
        ctx.accounts.sell_shares(shares_amount, is_yes)?;
        Ok(())
    }

    pub fn parlay_bet(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn resolve_market(ctx: Context<Resolve>, outcome: state::MarketOutcome) -> Result<()> {
        ctx.accounts.resolve_market(outcome)?;
        Ok(())
    }

    pub fn claim_bettor_amount(ctx: Context<ClaimAmount>, shares_amount: u64) -> Result<()> {
        // Make sure claim only happens after Resolve
        ctx.accounts.claim_amount(shares_amount)?;
        Ok(())
    }

    pub fn admin_withdraw_profit(ctx: Context<AdminWithdraw>) -> Result<()> {
        ctx.accounts.admin_withdraw_revenue()?;
        Ok(())
    }

    pub fn bettor_withdraw_amount(ctx: Context<BettorWithdraw>) -> Result<()> {
        ctx.accounts.bettor_withdraw()?;
        Ok(())
    }

    pub fn ban_bettor(ctx: Context<Ban>) -> Result<()> {
        ctx.accounts.ban_bettor()?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
