use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ChauMarket {
    #[max_len(30)]
    pub market_name: String,
    #[max_len(150)]
    pub description: String,

    pub lsmr_b: u8,
    pub dead_line: i64, // unix_time_stamp

    pub market_state: MarketStatus,
    pub locked_bool: bool,

    pub mint_yes_shares: u64, // q1
    pub mint_no_shares: u64,  // q2

    pub mint_yes_bump: u8,
    pub mint_no_bump: u8,
    pub market_vault_bump: u8,
    pub market_bump: u8,
}

#[derive(InitSpace, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub enum MarketStatus {
    Resolved, // The market has been resolved.
    Active,   // The market is still active (not resolved).
}
