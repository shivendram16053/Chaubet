use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::{
    constant::*,
    state::{chau_config, Bet, ChauConfig, ChauMarket},
};
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
//  - create bettor token_account for mint_yes and mint_no

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        seeds = [CHAU_CONFIG],
        bump = chau_config.config_bump
    )]
    pub chau_config: Account<'info, ChauConfig>,

    #[account(
        mut,
        seeds = [MARKET, chau_config.key().to_bytes().as_ref()],
        bump = chau_market.market_bump
    )]
    pub chau_market: Account<'info, ChauMarket>,

    #[account(
        mut,
        seeds = [MINT_YES,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.mint_yes_bump,
    )]
    pub mint_yes: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [MINT_NO,chau_market.key().to_bytes().as_ref()],
        bump = chau_market.mint_no_bump
    )]
    pub mint_no: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        seeds = [TREASURY,chau_config.key().to_bytes().as_ref()],
        bump  = chau_market.market_vault_bump
    )]
    pub market_vault_account: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = bettor,
        space = Bet::DISCRIMINATOR.len() + Bet::INIT_SPACE,
        seeds = [BET,chau_market.key().to_bytes().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,

    #[account(
        init_if_needed,
        payer = bettor,
        associated_token::authority = bettor,
        associated_token::mint = mint_yes
    )]
    pub bettor_yes_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = bettor,
        associated_token::authority = bettor,
        associated_token::mint = mint_no
    )]
    pub bettor_no_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> BuyShares<'info> {
    pub fn buy_shares(
        &mut self,
        bumps: BuySharesBumps,
        shares_amount: u64,
        is_yes: bool,
    ) -> Result<()> {
        // calculate the amount of shares and save the Data
        // initialize LMSR Struct(Decimal type)

        Ok(())
    }
    fn deposite_wager(amount: u64) -> Result<()> {
        // transfer wager amount from bettor to vault account
        Ok(())
    }
    fn send_shares(amount: u64, is_yes: bool) -> Result<()> {
        // trasnfer shares to bettor token account
        // update the LMSR Struct after transfering shars to bettor
        Ok(())
    }
}
