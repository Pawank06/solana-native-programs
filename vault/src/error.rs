use thiserror::Error;
use solana_program::program_error::ProgramError;

#[derive(Error, Debug, Copy, Clone)]
pub enum EscrowError {
    #[error("Invalid instruction")]
    InvalidInstruction,

    #[error("Account not rent exempt")]
    NotRentExempt,

    #[error("Expected amount mismatch")]
    ExpectedAmountMismatch,

    #[error("Amount overflow")]
    AmountOverflow,

    #[error("Invalid state transition")]
    InvalidStateTransition,

    #[error("Invalid signer")]
    InvalidSigner,

    #[error("Account not owend by program")]
    AccountNotOwnedByProgram,

    #[error("Invalid PDA")]
    InvalidPDA,

    #[error("Escrow already initialized")]
    AlreadyInitialized,

    #[error("Escrow not initialized")]
    NotInitialized,

    #[error("Invalid account data")]
    InvalidAccountData,

    #[error("Insufficient funds")]
    InsufficientFunds,
}

impl From<EscrowError> for ProgramError {
    fn from(e: EscrowError) -> Self {
        ProgramError::Custom(e as u32)
    }
}