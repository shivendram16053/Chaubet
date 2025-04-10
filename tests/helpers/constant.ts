import * as anchor from "@coral-xyz/anchor";

export const admin = anchor.web3.Keypair.generate();
export const admin_two = anchor.web3.Keypair.generate();
export const admin_three = anchor.web3.Keypair.generate();

export const bettor_one = anchor.web3.Keypair.generate();
export const bettor_two = anchor.web3.Keypair.generate();

export const mint_yes = anchor.web3.Keypair.generate();
export const mint_no = anchor.web3.Keypair.generate();
