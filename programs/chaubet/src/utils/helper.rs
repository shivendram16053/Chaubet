use anchor_lang::prelude::*;

// ---------- Enums -----------------

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MarketArg {
    pub name: String,
    pub description: String,
    pub lmsr_b: u16,
    pub dead_line: i64,
}

// -------------- helper functions ------------
// - calculate cost function
// - calculate price function
// - calculate liquidity function
// - calculate market score function
