import * as anchor from "@coral-xyz/anchor";
import { PROGRAM_ID } from "./setup";
import { admin, bettor_one, bettor_two, mint_no, mint_yes } from "./constant";
import {
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

  // seeds = [BETTOR_WALLET,bettor.key().to_bytes().as_ref(), chau_config.key().to_bytes().as_ref()],
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

  // seeds = [MARKET_VAULT,chau_market.key().to_bytes().as_ref()],
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
  mintAuthority: anchor.web3.Keypair // owner is chauConfig
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
      mintAuthority.publicKey,
      null
    );

    const mintNoIx = createInitializeMint2Instruction(
      mint_no.publicKey,
      6,
      mintAuthority.publicKey,
      null
    );

    await makeTransaction(
      client,
      [accountYesIx, accountNoIx, mintYesIx, mintNoIx],
      [admin, mintAuthority],
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

export const getAllATA = (
  mintYes: anchor.web3.PublicKey,
  mintNO: anchor.web3.PublicKey
) => {
  const bettorOneYesATA = getAssociatedTokenAddressSync(
    mintYes,
    bettor_one.publicKey,
    true
  );

  const bettorTwoYesATA = getAssociatedTokenAddressSync(
    mintYes,
    bettor_two.publicKey,
    true
  );

  const bettorOneNoATA = getAssociatedTokenAddressSync(
    mintNO,
    bettor_one.publicKey,
    true
  );

  const bettorTwoNoATA = getAssociatedTokenAddressSync(
    mintNO,
    bettor_two.publicKey,
    true
  );

  return {
    bettorOneNoATA,
    bettorOneYesATA,

    bettorTwoYesATA,
    bettorTwoNoATA,
  };
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
