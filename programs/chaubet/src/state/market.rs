use crate::error::ChauError;
use crate::{add_or_sub, decimal_convo, div, mul};
use anchor_lang::prelude::*;
use rust_decimal::prelude::*;

use super::MarketOutcome;

#[account]
#[derive(InitSpace)]
pub struct ChauMarket {
    #[max_len(30)]
    pub market_name: String,
    #[max_len(150)]
    pub description: String,

    pub lsmr_b: u64,    // make sure b is higher (eg:- 100)
    pub dead_line: i64, // unix_time_stamp

    pub market_state: MarketStatus,
    pub market_outcome: MarketOutcome, // changable

    pub outcome_yes_shares: u64, // q1
    pub outcome_no_shares: u64,  // q2

    pub mint_yes_bump: u8,
    pub mint_no_bump: u8,
    pub market_vault_bump: u8,
    pub market_bump: u8,
}

#[derive(InitSpace, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
#[repr(u8)]
pub enum MarketStatus {
    Resolved, // The market has been resolved.
    Active,   // The market is still active (not resolved).
}

impl ChauMarket {
    pub fn init_chaumarket(&mut self, arg: ChauMarket) -> Self {
        // Convert all numbers to decimal_convo
        Self {
            market_name: arg.market_name,
            description: arg.description,

            // LMSR liquidity
            lsmr_b: arg.lsmr_b,
            dead_line: arg.dead_line,

            // market state
            market_state: arg.market_state,
            market_outcome: arg.market_outcome,

            // shares
            outcome_yes_shares: arg.outcome_yes_shares,
            outcome_no_shares: arg.outcome_no_shares,

            // bumps
            mint_yes_bump: arg.mint_yes_bump,
            mint_no_bump: arg.mint_no_bump,
            market_vault_bump: arg.market_vault_bump,
            market_bump: arg.market_bump,
        }
    }

    // price of outcome_yes_shares
    pub fn price_calculation(&self, is_yes: bool) -> Result<Decimal> {
        let pow_yes = div!(
            decimal_convo!(self.outcome_yes_shares),
            decimal_convo!(self.lsmr_b)
        )
        .exp();

        let pow_no = div!(
            decimal_convo!(self.outcome_no_shares),
            decimal_convo!(self.lsmr_b)
        )
        .exp();
        let denominator = add_or_sub!(pow_yes, pow_no, true)?;

        match is_yes {
            true => Ok(div!(pow_yes, denominator)),

            false => Ok(div!(pow_no, denominator)),
        }
    }

    // cost calculation
    pub fn cost_calculation(&self, yes_shares: &Decimal, no_shares: &Decimal) -> Result<Decimal> {
        // cost function = b.ln(e.pow(q1/b) + e.pow(q2/b));

        let outcome_yes = div!(yes_shares, decimal_convo!(Decimal::from(self.lsmr_b))).exp(); // e.pow(q1/b)
        let outcome_no = div!(no_shares, decimal_convo!(self.lsmr_b)).exp(); // e.pow(q2/b)
        let outcome_sum = add_or_sub!(outcome_yes, outcome_no, true)?; // e.pow(q1/b) + e.pow(q2/b)

        let cost = mul!(outcome_sum.ln(), decimal_convo!(self.lsmr_b)); // b.ln(e.pow(q1/b) + e.pow(q2/b))

        Ok(cost)
    }

    // share calculation
    pub fn share_calculation(
        &self,
        is_buy: bool,
        yes_shares: u64,
        no_shares: u64,
        fee_bps: u16,
    ) -> Result<Decimal> {
        // Delta C = C2 - C1;(New Cost Function - Current Cost Function)
        let current_cost = self.cost_calculation(
            &decimal_convo!(self.outcome_yes_shares),
            &decimal_convo!(self.outcome_no_shares),
        )?;

        // q2 + q1(for buying) & q2 - q1 (for selling)
        let new_yes = add_or_sub!(
            decimal_convo!(self.outcome_yes_shares),
            decimal_convo!(yes_shares),
            is_buy
        )?;

        let new_no = add_or_sub!(
            decimal_convo!(self.outcome_no_shares),
            decimal_convo!(no_shares),
            is_buy
        )?;

        let new_cost = self.cost_calculation(&new_yes, &new_no)?;

        let delta_cost = match is_buy {
            true => {
                // c2 >> c1
                add_or_sub!(new_cost, current_cost, false)?
            }
            false => {
                // c1 >> c2
                add_or_sub!(current_cost, new_cost, false)?
            }
        };

        // calculating the fees
        let share_cost = self.fees_calculation(fee_bps, delta_cost, is_buy)?;

        Ok(share_cost)
    }

    // fee calculation
    fn fees_calculation(&self, fee_bps: u16, delta_cost: Decimal, is_buy: bool) -> Result<Decimal> {
        // Check: make sure the given fees is good
        require!(fee_bps < 10000 && fee_bps != 0, ChauError::InvalidFees);

        let div_fee = div!(Decimal::from(1), Decimal::from(10000));

        let mul_fee = mul!(Decimal::from(fee_bps), div_fee);
        let fees = mul!(delta_cost, add_or_sub!(Decimal::from(1), mul_fee, false)?);

        let total_fees = add_or_sub!(delta_cost, fees, is_buy)?;
        Ok(total_fees)
    }
}
