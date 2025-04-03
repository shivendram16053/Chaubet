use anchor_lang::prelude::*;

use super::MarketStatus;

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub bettor_pubkey: Pubkey,
    pub market_pubkey: Pubkey,

    pub bet_amount: u64,               // changable
    pub market_status: MarketStatus,   // changable
    pub market_outcome: MarketOutcome, // changable

    pub bettor_shares: u64, // changable

    pub is_initialized: bool, // added this for safty check for reinitialization attackes
    pub bet_bump: u8,
}

#[derive(InitSpace, AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum MarketOutcome {
    YES,
    NO,
    NotResolved,
}
