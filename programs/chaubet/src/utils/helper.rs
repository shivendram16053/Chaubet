use crate::error::ChauError;
use crate::{add_or_sub, check_zero, div, mul};
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
    pub lmsr_b: Decimal,             // b
    pub outcome_yes_shares: Decimal, // q1
    pub outcome_no_shares: Decimal,  // q2
}

// -------------- helper functions ------------

impl LMSR {
    pub fn init_lmsr(lmsr_b: u16, outcome_yes_shares: u64, outcome_no_shares: u64) -> Self {
        // Convert all numbers to Decimal
        LMSR {
            lmsr_b: Decimal::from(lmsr_b),
            outcome_yes_shares: Decimal::from(outcome_yes_shares),
            outcome_no_shares: Decimal::from(outcome_no_shares),
        }
    }

    pub fn yes_shares(mut self, new_yes_shares: u64) -> Result<()> {
        check_zero!([Decimal::from(new_yes_shares)]);
        self.outcome_yes_shares = Decimal::from(new_yes_shares);
        Ok(())
    }

    pub fn no_shares(mut self, new_no_shares: u64) -> Result<()> {
        check_zero!([Decimal::from(new_no_shares)]);
        self.outcome_no_shares = Decimal::from(new_no_shares);
        Ok(())
    }

    // price of outcome_yes_shares
    pub fn price_calculation(self, is_yes: bool) -> Result<Decimal> {
        // Check: check if the given inputs are zero
        check_zero!([self.outcome_yes_shares, self.outcome_no_shares]);

        let pow_yes = div!(self.outcome_yes_shares, self.lmsr_b).exp();
        let pow_no = div!(self.outcome_no_shares, self.lmsr_b).exp();
        let denominator = add_or_sub!(pow_yes, pow_no, true)?;

        match is_yes {
            true => Ok(div!(pow_yes, denominator)),

            false => Ok(div!(pow_no, denominator)),
        }
    }

    // cost calculation
    pub fn cost_calculation(self) -> Result<Decimal> {
        check_zero!([self.outcome_yes_shares, self.outcome_no_shares]);

        // cost function = b.ln(e.pow(q1/b) + e.pow(q2/b));

        let outcome_yes = div!(self.outcome_yes_shares, self.lmsr_b).exp();
        let outcome_no = div!(self.outcome_no_shares, self.lmsr_b).exp();
        let outcome_sum = add_or_sub!(outcome_yes, outcome_no, true)?;

        let cost = mul!(outcome_sum.ln(), self.lmsr_b);

        Ok(cost)
    }

    // share calculation
    pub fn share_calculation(self, is_buy: bool) -> Result<()> {
        check_zero!([self.outcome_yes_shares, self.outcome_no_shares]);
        // Delta C = C2 - C1;

        match is_buy {
            true => {
                // C2 > C1
                let c_one = self.cost_calculation()?;
            }
            false => {
                // C1 > C1
            }
        }

        Ok(())
    }

    // fee calculation
    pub fn fees_calculation(self) -> Result<()> {
        check_zero!([self.outcome_yes_shares, self.outcome_no_shares]);

        Ok(())
    }
}

// - calculate cost function
// - calculate price function
// - calculate fees based on payout and buy (fees will be 1% to 0.5%)
