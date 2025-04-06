use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bettor {
    pub bettor_pubkey: Pubkey,
    #[max_len(30)]
    pub bettor_name: Option<String>,

    pub bettor_net_profit: i64, // i64 bcoz bettor might be in profit or in loss
    pub balance: u64,

    pub is_ban: bool, // Ban those bettors who voilate the platform rules

    pub bettor_vault_bump: u8,
    pub bettor_bump: u8,
}
