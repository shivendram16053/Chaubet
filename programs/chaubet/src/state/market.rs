use anchor_lang::prelude::*;

#[account]
pub struct Market {
    pub market_name: String,
    pub description: String,
    pub lsmr_b: u8,
    pub dead_line: i64, // unix_time_stamp

    pub market_state: MarketStatus,
    pub locked_bool: bool,

    pub mint_yes_shares: u64,
    pub mint_no_shares: u64,

    pub mint_yes_bump: u8,
    pub mint_no_bump: u8,
    pub market_bump: u8,
    pub market_seed: u8,
}

#[derive(Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub enum MarketStatus {
    Resolved, // The market has been resolved.
    Active,   // The market is still active (not resolved).
}
