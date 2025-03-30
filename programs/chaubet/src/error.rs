use anchor_lang::prelude::*;

#[error_code]
pub enum ChauError {
    #[msg("Max Admin Lenght Exceeded")]
    ToManyAdmins,

    #[msg("The liquidity parameter b is too low")]
    ParameterTooLow,

    #[msg("The admin already exist no need to sign again")]
    AdminExist,

    #[msg("you are not authourized to do this instruction")]
    UnAuthourized,

    #[msg("This account is already initialized")]
    AccountAlreadyInitialized,

    #[msg("Overflow Error occured")]
    ArthemeticOverflow,

    #[msg("Underflow Error occured")]
    ArthemeticUnserflow,

    #[msg("Mathmatical Error Occured")]
    ArthemeticError,

    #[msg("Amount cannot be Zero")]
    ZeroAmount,
}
