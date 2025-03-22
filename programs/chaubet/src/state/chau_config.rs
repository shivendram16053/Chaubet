use anchor_lang::prelude::*;

#[account]
pub struct ChauConfig {
    pub admin: Pubkey,
    pub fees: u16, // basis points (example: 100 basis = 1%; 1 basis = 0.01)
    pub trasury_bump: u8,
    pub config_bump: u8,
}
