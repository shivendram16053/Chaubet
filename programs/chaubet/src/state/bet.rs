use anchor_lang::prelude::*;

use super::MarketStatus;

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub bettor_pubkey: Pubkey,
    pub market_pubkey: Pubkey,

    pub bet_amount: u64,
    pub market_status: MarketStatus,
    pub market_outcome: MarketOutcome,

    pub bettor_shares: u16,
    pub payout_amount: u16,

    pub bet_bump: u8,
}

#[derive(InitSpace, AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum MarketOutcome {
    YES,
    NO,
    NotResolved,
}
