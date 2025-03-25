use anchor_lang::prelude::*;

#[error_code]
pub enum ChauError {
    #[msg("Max Admin Lenght Exceeded")]
    ToManyAdmins,

    #[msg("The admin already exist no need to sign again")]
    AdminExist,

    #[msg("you are not authourized to do this instruction")]
    UnAuthourized,

    #[msg("This account is already initialized")]
    AccountAlreadyInitialized,
}
