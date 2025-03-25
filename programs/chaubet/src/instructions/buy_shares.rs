use anchor_lang::prelude::*;
// Context
// - when bettor buys any mint_shares then, we should mint the tokens and update all required pdas
//   only the bettor himself should initialize the pda and make sure there is no reinitialized
//   attackes or lamport drain attackes
//
//  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
//  Accounts
//  - bettor(Signer)
//  - bet (PDA)-- init_if_needed
//  - chau_config(PDA)
//  - chau_market(PDA)
//  - mint_yes
//  - mint_no
//  - bettor token_account(init_if_needed)

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,
}
