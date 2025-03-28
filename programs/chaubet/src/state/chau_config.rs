use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ChauConfig {
    #[max_len(3)]
    pub admin: Vec<Pubkey>,
    pub fees: u16, // basis points (example: 100 basis = 1%; 1 basis = 0.01)

    pub treasuty_amount: u64,
    pub trasury_bump: u8,
    pub config_bump: u8,
}
