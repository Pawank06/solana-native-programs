import {expect, test} from "bun:test";
import * as borsh from "borsh";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { COUNTER_SIZE, schema } from "./types";

let adminAccount = Keypair.generate();
let dataAccount = Keypair.generate();

const programId = new PublicKey("9TqUbWQQnPoRK7Rmwk2e8puBnqyYiaRjMBuYsgsasD3b");

test("Account is initialize", async () => {
    const connection = new Connection("http://127.0.0.1:8899");
    const tx = await connection.requestAirdrop(adminAccount.publicKey, 1 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(tx)

    const data = await connection.getAccountInfo(adminAccount.publicKey);
    
    const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);

    const ix = SystemProgram.createAccount({
        fromPubkey: adminAccount.publicKey,
        lamports,
        space: COUNTER_SIZE,
        programId: programId,
        newAccountPubkey: dataAccount.publicKey
    })

    const txn = new Transaction();
    txn.add(ix);
    const signature = await connection.sendTransaction(txn, [adminAccount, dataAccount]);

    await connection.confirmTransaction(signature);

    console.log(dataAccount.publicKey);

    const dataAccountInfo = await connection.getAccountInfo(dataAccount.publicKey);
    const counter = borsh.deserialize(schema, dataAccountInfo?.data);
    console.log("Counter count", counter.count);
    expect(counter?.count).toBe(0);
})

test("Make sure increase works", async () => {
    const connection = new Connection("http://127.0.0.1:8899");
    
    // Create instruction data for incrementing by 5
    const incrementInstruction = {
        variant: 0, // Increment variant
        value: 5
    };
    
    const instructionSchema: borsh.Schema = {
        struct: {
            variant: 'u8',
            value: 'u32'
        }
    };
    
    const instructionData = borsh.serialize(instructionSchema, incrementInstruction);
    
    // Create transaction with increment instruction
    const ix = {
        keys: [
            {
                pubkey: dataAccount.publicKey,
                isSigner: false,
                isWritable: true
            }
        ],
        programId: programId,
        data: Buffer.from(instructionData)
    };
    
    const txn = new Transaction();
    txn.add(ix);
    
    const signature = await connection.sendTransaction(txn, [adminAccount]);
    await connection.confirmTransaction(signature);
    
    // Verify the counter increased
    const dataAccountInfo = await connection.getAccountInfo(dataAccount.publicKey);
    const counter = borsh.deserialize(schema, dataAccountInfo?.data);
    console.log("Counter count after increment:", counter.count);
    expect(counter?.count).toBe(5);
});

test("Make sure decrease works", async () => {
    const connection = new Connection("http://127.0.0.1:8899");
    
    // Create instruction data for decrementing by 2
    const decrementInstruction = {
        variant: 1, // Decrement variant
        value: 2
    };
    
    const instructionSchema: borsh.Schema = {
        struct: {
            variant: 'u8',
            value: 'u32'
        }
    };
    
    const instructionData = borsh.serialize(instructionSchema, decrementInstruction);
    
    // Create transaction with decrement instruction
    const ix = {
        keys: [
            {
                pubkey: dataAccount.publicKey,
                isSigner: false,
                isWritable: true
            }
        ],
        programId: programId,
        data: Buffer.from(instructionData)
    };
    
    const txn = new Transaction();
    txn.add(ix);
    
    const signature = await connection.sendTransaction(txn, [adminAccount]);
    await connection.confirmTransaction(signature);
    
    // Verify the counter decreased (5 - 2 = 3)
    const dataAccountInfo = await connection.getAccountInfo(dataAccount.publicKey);l
    const counter = borsh.deserialize(schema, dataAccountInfo?.data);
    console.log("Counter count after decrement:", counter.count);
    expect(counter?.count).toBe(3);
});