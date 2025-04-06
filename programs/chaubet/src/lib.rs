use anchor_lang::prelude::*;

declare_id!("8PXHZ4Y6noy89qMEVBhGgeLGFuMzkP1QXFwBTAsRD2Hd");
pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

// - Check about Decimals in outcome tokens
// - Implement Parlay betting feauture
// - after resolve then update the bettor profit
// - Implement the net profit of bettor algo perfectly

#[program]
pub mod chaubet {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, fees: u16) -> Result<()> {
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
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn resolve_market(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn claim_better_amount(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        // Make sure claim only happens after locked is false
        Ok(())
    }

    pub fn close_market(ctx: Context<Initialize>) -> Result<()> {
        // Should be done by admin
        Ok(())
    }

    pub fn admin_withdraw_profit(ctx: Context<Initialize>) -> Result<()> {
        // Should be Done by Admine
        Ok(())
    }

    pub fn ban_bettor(ctx: Context<Initialize>) -> Result<()> {
        // Only Done by the admin of this Platform
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
