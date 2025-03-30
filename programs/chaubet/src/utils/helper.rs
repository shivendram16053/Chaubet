use crate::error::ChauError;
use crate::{check_zero, div};
use anchor_lang::prelude::*;
use rust_decimal::prelude::*;

// ---------- Structs -----------------

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MarketArg {
    pub name: String,
    pub description: String,
    pub lmsr_b: u16,
    pub dead_line: i64,
}

#[derive(Default)]
pub struct LMSR {
    pub lmsr_b: u16,             // b
    pub outcome_yes_shares: u64, // q1
    pub outcome_no_shares: u64,  // q2
}

// -------------- helper functions ------------

impl LMSR {
    pub fn init_lmsr(lmsr_b: u16, outcome_yes_shares: u64, outcome_no_shares: u64) -> Self {
        LMSR {
            lmsr_b,
            outcome_yes_shares,
            outcome_no_shares,
        }
    }

    pub fn yes_shares(mut self, new_yes_shares: u64) -> Result<()> {
        self.outcome_yes_shares = new_yes_shares;
        Ok(())
    }

    pub fn no_shares(mut self, new_no_shares: u64) -> Result<()> {
        self.outcome_no_shares = new_no_shares;
        Ok(())
    }

    // price of outcome_yes_shares
    pub fn price_calculation(self, is_yes: bool) -> Result<()> {
        check_zero!([self.outcome_yes_shares, self.outcome_no_shares]);

        // let yes_pow = div!(dec!(self.outcome_yes_shares), dec!(self.lmsr_b));
        // let price_yes = e.pow(q1/b)/(e.pow(q1/b) + e.pow(q2/b))

        Ok(())
    }

    // cost calculation
    // price calculation
    // share calculation with fees based on buy or sell
    // sell calculation
}

// - calculate cost function
// - calculate price function
// - calculate fees based on payout and buy (fees will be 1% to 0.5%)
