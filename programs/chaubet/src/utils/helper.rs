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

    pub fn yes_shares(&mut self, new_yes_shares: u64) -> Result<()> {
        check_zero!([Decimal::from(new_yes_shares)]);
        self.outcome_yes_shares = Decimal::from(new_yes_shares);
        Ok(())
    }

    pub fn no_shares(&mut self, new_no_shares: u64) -> Result<()> {
        check_zero!([Decimal::from(new_no_shares)]);
        self.outcome_no_shares = Decimal::from(new_no_shares);
        Ok(())
    }

    // price of outcome_yes_shares
    pub fn price_calculation(&self, is_yes: bool) -> Result<Decimal> {
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
    pub fn cost_calculation(&self, yes_shares: &Decimal, no_shares: &Decimal) -> Result<Decimal> {
        check_zero!([self.outcome_yes_shares, self.outcome_no_shares]);

        // cost function = b.ln(e.pow(q1/b) + e.pow(q2/b));

        let outcome_yes = div!(yes_shares, self.lmsr_b).exp();
        let outcome_no = div!(no_shares, self.lmsr_b).exp();
        let outcome_sum = add_or_sub!(outcome_yes, outcome_no, true)?;

        let cost = mul!(outcome_sum.ln(), self.lmsr_b);

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
        check_zero!([self.outcome_yes_shares, self.outcome_no_shares]);
        // Delta C = C2 - C1;(New Cost Function - Current Cost Function)

        match is_buy {
            true => {
                // c2 > c1
                let new_yes =
                    add_or_sub!(self.outcome_yes_shares, Decimal::from(yes_shares), true)?;
                let new_no = add_or_sub!(self.outcome_no_shares, Decimal::from(no_shares), true)?;

                let current_cost =
                    self.cost_calculation(&self.outcome_yes_shares, &self.outcome_no_shares)?;
                let new_cost = self.cost_calculation(&new_yes, &new_no)?;

                let delta_cost = add_or_sub!(new_cost, current_cost, false)?;

                // calculating the fees
                let fees = self.fees_calculation(fee_bps, delta_cost)?;

                let share_cost = add_or_sub!(delta_cost, fees, true)?;

                Ok(share_cost)
            }
            false => {
                // c1 > c1
                let new_yes =
                    add_or_sub!(self.outcome_yes_shares, Decimal::from(yes_shares), false)?;
                let new_no = add_or_sub!(self.outcome_no_shares, Decimal::from(no_shares), false)?;

                let current_cost =
                    self.cost_calculation(&self.outcome_yes_shares, &self.outcome_no_shares)?;
                let new_cost = self.cost_calculation(&new_yes, &new_no)?;

                let delta_cost = add_or_sub!(current_cost, new_cost, false)?;
                Ok(delta_cost)
            }
        }
    }

    // fee calculation
    pub fn fees_calculation(&self, fee_bps: u16, delta_cost: Decimal) -> Result<Decimal> {
        check_zero!([self.outcome_yes_shares, self.outcome_no_shares]);
        require!(fee_bps < 10000 && fee_bps != 0, ChauError::InvalidFees);

        let div_part = div!(Decimal::from(1), Decimal::from(10000));

        let fee_pes = mul!(Decimal::from(fee_bps), div_part);
        let fees = mul!(delta_cost, add_or_sub!(Decimal::from(1), fee_pes, false)?);

        let net_fee = add_or_sub!(delta_cost, fees, false)?;

        Ok(net_fee)
    }
}
