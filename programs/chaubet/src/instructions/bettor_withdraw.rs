use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::{check_ban, constant::*, error::ChauError, state::*};

#[derive(Accounts)]
pub struct BettorWithdraw<'info> {
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
        seeds = [MARKET, chau_config.key().to_bytes().as_ref(),&chau_market.market_name.as_bytes()[..32]],
        bump = chau_market.market_bump
    )]
    pub chau_market: Account<'info, ChauMarket>,

    #[account(
        mut,
        seeds = [WAGER,chau_market.key().to_bytes().as_ref(),bettor.key().to_bytes().as_ref()],
        bump = wager_account.bet_bump,
    )]
    pub wager_account: Account<'info, Wager>,

    #[account(
        mut,
        seeds = [BETTOR_WALLET,bettor.key().to_bytes().as_ref(), chau_config.key().to_bytes().as_ref()],
        bump = bettor_profile.bettor_vault_bump
    )]
    pub bettor_wallet_account: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [BETTOR_PROFILE,bettor.key().to_bytes().as_ref(),chau_config.key().to_bytes().as_ref()],
        bump = bettor_profile.bettor_bump,

        constraint = bettor_profile.bettor_pubkey == bettor.key() @ ChauError::InvalidAccount

    )]
    pub bettor_profile: Account<'info, Bettor>,

    pub system_program: Program<'info, System>,
}

impl<'info> BettorWithdraw<'info> {
    pub fn bettor_withdraw(&mut self) -> Result<()> {
        check_ban!(self.bettor_profile.is_ban);

        let accounts = Transfer {
            from: self.bettor_wallet_account.to_account_info(),
            to: self.bettor.to_account_info(),
        };

        let bettor_seeds = self.bettor.key().to_bytes();
        let chau_config_seeds = self.chau_config.key().to_bytes();
        let seeds = &[
            BETTOR_WALLET,
            bettor_seeds.as_ref(),
            chau_config_seeds.as_ref(),
            &[self.bettor_profile.bettor_vault_bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        transfer(ctx, self.bettor_wallet_account.lamports())?;
        Ok(())
    }
}
