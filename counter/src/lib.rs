use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info}, 
    entrypoint, 
    entrypoint::ProgramResult, 
    msg, 
    pubkey::Pubkey
};

#[derive(BorshSerialize, BorshDeserialize)]
enum InstructionType {
    Increment(u32),
    Decrement(u32)
}

#[derive(BorshSerialize, BorshDeserialize)]
struct Counter {
    count: u32
}

entrypoint!(counter_program);
fn counter_program(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instructions_data: &[u8]
) -> ProgramResult{
    let acc = next_account_info(&mut accounts.iter())?;
    let instructions = InstructionType::try_from_slice(instructions_data)?;
    let mut counter_data = Counter::try_from_slice(&acc.data.borrow())?;

    match instructions {
        InstructionType::Increment(value) => {
            counter_data.count += value;
            msg!("Count Increased");

        }
        InstructionType::Decrement(value) => {
            counter_data.count -= value;
            msg!("Count Decreased");
        }
    }

    counter_data.count.serialize(&mut *acc.data.borrow_mut())?;
    msg!("Contract Succeeded");
    Ok(())
}