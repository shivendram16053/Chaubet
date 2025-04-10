import * as anchor from "@coral-xyz/anchor";
import { PROGRAM_ID } from "./setup";
import { admin, bettor_one, bettor_two, mint_no, mint_yes } from "./constant";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  getAssociatedTokenAddressSync,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BanksClient } from "solana-bankrun";

export const getAllPDA = () => {
  const [chauConfig] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("admin_config")],
    PROGRAM_ID
  );

  const [chauMarket] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("market"), chauConfig.toBuffer()],
    PROGRAM_ID
  );

  const [bettorOneProfile] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("bettor_profile"),
      bettor_one.publicKey.toBuffer(),
      chauConfig.toBuffer(),
    ],
    PROGRAM_ID
  );

  const [bettorTwoProfile] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("bettor_profile"),
      bettor_two.publicKey.toBuffer(),
      chauConfig.toBuffer(),
    ],
    PROGRAM_ID
  );

  const [wagerOneAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("bet"),
      chauMarket.toBuffer(),
      bettor_one.publicKey.toBuffer(),
    ],
    PROGRAM_ID
  );

  const [wagerTwoAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("bet"),
      chauMarket.toBuffer(),
      bettor_two.publicKey.toBuffer(),
    ],
    PROGRAM_ID
  );

  // System Accounts
  const [treasuryAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), chauConfig.toBuffer()],
    PROGRAM_ID
  );

  const [bettorOneVaultAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("bettor_wallet"),
      bettor_one.publicKey.toBuffer(),
      chauConfig.toBuffer(),
    ],

    PROGRAM_ID
  );

  const [bettorTwoVaultAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("bettor_wallet"),
      bettor_two.publicKey.toBuffer(),
      chauConfig.toBuffer(),
    ],

    PROGRAM_ID
  );

  const [marketVaultAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("market_vault"), chauMarket.toBuffer()],
    PROGRAM_ID
  );

  return {
    chauConfig,
    chauMarket,

    bettorOneProfile,
    bettorTwoProfile,

    wagerOneAccount,
    wagerTwoAccount,

    treasuryAccount,
    marketVaultAccount,

    bettorOneVaultAccount,
    bettorTwoVaultAccount,
  };
};

export const getAllMint = async (
  client: BanksClient,
  mintAuthority: anchor.web3.PublicKey // owner is chauConfig
) => {
  try {
    const rent = await client.getRent();

    const accountYesIx = anchor.web3.SystemProgram.createAccount({
      programId: TOKEN_PROGRAM_ID,
      fromPubkey: admin.publicKey,
      lamports: Number(rent.minimumBalance(BigInt(MINT_SIZE))),
      space: MINT_SIZE,
      newAccountPubkey: mint_yes.publicKey,
    });

    const accountNoIx = anchor.web3.SystemProgram.createAccount({
      programId: TOKEN_PROGRAM_ID,
      fromPubkey: admin.publicKey,
      lamports: Number(rent.minimumBalance(BigInt(MINT_SIZE))),
      space: MINT_SIZE,
      newAccountPubkey: mint_no.publicKey,
    });

    const mintYesIx = createInitializeMint2Instruction(
      mint_yes.publicKey,
      6,
      mintAuthority,
      null
    );

    const mintNoIx = createInitializeMint2Instruction(
      mint_no.publicKey,
      6,
      mintAuthority,
      null
    );

    await makeTransaction(
      client,
      [accountYesIx, accountNoIx, mintYesIx, mintNoIx],
      [admin, mint_yes, mint_no],
      false
    );

    return {
      mint_yes,
      mint_no,
    };
  } catch (error) {
    throw new Error(
      `You got an error while trying get mint accounts(file name:- helper.ts) ${error}`
    );
  }
};

export const getAllATA = async (
  mintYes: anchor.web3.PublicKey,
  mintNO: anchor.web3.PublicKey,
  client: BanksClient
) => {
  try {
    const bettorOneYesATA = await createATA(bettor_one, mintYes, client);

    const bettorTwoYesATA = await createATA(bettor_two, mintYes, client);

    const bettorOneNoATA = await createATA(bettor_one, mintNO, client);

    const bettorTwoNoATA = await createATA(bettor_two, mintNO, client);

    return {
      bettorOneNoATA,
      bettorOneYesATA,

      bettorTwoYesATA,
      bettorTwoNoATA,
    };
  } catch (error) {
    throw new Error(`You got an error while getting all ATA ${error}`);
  }
};

const createATA = async (
  owner: anchor.web3.Keypair,
  mint: anchor.web3.PublicKey,
  client: BanksClient
) => {
  try {
    const bettorATA = getAssociatedTokenAddressSync(
      mint,
      owner.publicKey,
      true
    );

    const ataIx = createAssociatedTokenAccountInstruction(
      owner.publicKey, // payer
      bettorATA, // ata address
      owner.publicKey, // owner of this ATA
      mint // Mint address of this ATA
    );

    await makeTransaction(client, [ataIx], [owner], false);

    return bettorATA;
  } catch (error) {
    throw new Error(`You got an error while creating an ATA ${error}`);
  }
};

export const makeTransaction = async (
  client: BanksClient,
  ix: anchor.web3.TransactionInstruction[],
  signer: anchor.web3.Signer[] = [],
  isFail: boolean
) => {
  try {
    const tx = new anchor.web3.Transaction();

    tx.recentBlockhash = (await client.getLatestBlockhash())[0];
    tx.add(...ix);
    tx.sign(...signer);

    if (isFail) {
      // If u know the transaction is going to fail then use this to get more info about the error
      let trxRes = await client.tryProcessTransaction(tx);

      return trxRes;
    } else {
      // If u know the transaction is not going to fail then use this
      let trxRes = await client.processTransaction(tx);

      return trxRes;
    }
  } catch (error) {
    throw new Error(`You got an error while making an transaction:- ${error}`);
  }
};
