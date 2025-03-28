use anchor_lang::prelude::*;

// ---------- Enums -----------------

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MarketArg {
    pub name: String,
    pub description: String,
    pub lmsr_b: u8,
    pub dead_line: i64,
}

// -------------- helper functions ------------

pub fn calculate_buy_amount() -> u64 {
    10
}
