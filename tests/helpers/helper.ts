import * as anchor from "@coral-xyz/anchor";
import { PROGRAM_ID } from "./setup";
import { bettor_one, bettor_two, malicious_guy } from "./constant";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  BanksClient,
  BanksTransactionResultWithMeta,
  Clock,
  ProgramTestContext,
} from "solana-bankrun";

export const getAllPDA = (marketName: string) => {
  const [chauConfig] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("admin_config")],
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

  const [maliciousProfile] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("bettor_profile"),
      malicious_guy.publicKey.toBuffer(),
      chauConfig.toBuffer(),
    ],
    PROGRAM_ID
  );

  const [chauMarket] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("market"),
      chauConfig.toBuffer(),
      Buffer.from(marketName.slice(0, 32), "utf8"),
    ],
    PROGRAM_ID
  );

  // wager accounts
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

  const [maliciousWagerAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("bet"),
      chauMarket.toBuffer(),
      malicious_guy.publicKey.toBuffer(),
    ],
    PROGRAM_ID
  );

  const [marketVaultAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("market_vault"), chauMarket.toBuffer()],
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

  const [maliciousGuyVaultAccount] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("bettor_wallet"),
        malicious_guy.publicKey.toBuffer(),
        chauConfig.toBuffer(),
      ],

      PROGRAM_ID
    );

  return {
    chauConfig,

    bettorOneProfile,
    bettorTwoProfile,
    maliciousProfile,

    treasuryAccount,

    wagerOneAccount,
    wagerTwoAccount,
    maliciousWagerAccount,

    marketVaultAccount,
    chauMarket,

    bettorOneVaultAccount,
    bettorTwoVaultAccount,
    maliciousGuyVaultAccount,
  };
};

export const getAllMint = async (chauMarket: anchor.web3.PublicKey) => {
  try {
    const [mintYes] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint_yes"), chauMarket.toBuffer()],
      PROGRAM_ID
    );

    const [mintNo] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint_no"), chauMarket.toBuffer()],
      PROGRAM_ID
    );

    return {
      mintYes,
      mintNo,
    };
  } catch (error) {
    throw new Error(
      `You got an error while trying get mint accounts(file name:- helper.ts) ${error}`
    );
  }
};

export const getAllATA = async (
  mintYes: anchor.web3.PublicKey,
  mintNO: anchor.web3.PublicKey
) => {
  try {
    const bettorOneYesATA = await createATA(bettor_one, mintYes);

    const bettorTwoYesATA = await createATA(bettor_two, mintYes);

    const bettorOneNoATA = await createATA(bettor_one, mintNO);

    const bettorTwoNoATA = await createATA(bettor_two, mintNO);

    const maliciousYesATA = await createATA(malicious_guy, mintYes);
    const maliciousNoATA = await createATA(malicious_guy, mintNO);

    return {
      bettorOneNoATA,
      bettorOneYesATA,

      bettorTwoYesATA,
      bettorTwoNoATA,

      maliciousYesATA,
      maliciousNoATA,
    };
  } catch (error) {
    throw new Error(`You got an error while getting all ATA ${error}`);
  }
};

const createATA = async (
  owner: anchor.web3.Keypair,
  mint: anchor.web3.PublicKey
) => {
  try {
    const bettorATA = getAssociatedTokenAddressSync(
      mint,
      owner.publicKey,
      true
    );

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
  const tx = new anchor.web3.Transaction();

  tx.recentBlockhash = (await client.getLatestBlockhash())[0];
  tx.add(...ix);
  tx.sign(...signer);

  let trxRes: BanksTransactionResultWithMeta;
  try {
    if (isFail) {
      // If u know the transaction is going to fail then use this to get more info about the error
      trxRes = await client.tryProcessTransaction(tx);

      throw new Error(trxRes.result);
    } else {
      // If u know the transaction is not going to fail then use this
      let trx = await client.processTransaction(tx);

      return trx;
    }
  } catch (error) {
    if (isFail) {
      console.log("📝 Transaction Logs:");
      console.log(
        `📡 CU of this Trx is: ${trxRes.meta.computeUnitsConsumed.toString()} `
      );

      trxRes.meta.logMessages.forEach((log, index) => {
        console.log(`The index: ${index + 1} and log is: ${log}`);
      });
    }

    throw new Error(
      `You got an error while trying make a transaction ${error}`
    );
  }
};

export function makeTimeTravle(
  context: ProgramTestContext,
  addedUnixTime: bigint,
  currentClock: Clock
) {
  context.setClock(
    new Clock(
      currentClock.slot,
      currentClock.epochStartTimestamp,
      currentClock.epoch,
      currentClock.leaderScheduleEpoch,
      currentClock.unixTimestamp + addedUnixTime // I cant do time travelling in real life atlest I can in do it in solana 🕰️
    )
  );
}
