import { ProgramTestContext, startAnchor } from "solana-bankrun";
import { Chaubet } from "../../target/types/chaubet";
import * as IDL from "../../target/idl/chaubet.json";
import * as anchor from "@coral-xyz/anchor";
import {
  admin,
  admin_three,
  admin_two,
  bettor_one,
  bettor_two,
  malicious_guy,
} from "./constant";
import { BankrunProvider } from "anchor-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { IContextAccount } from "./types";

export const PROGRAM_ID = new anchor.web3.PublicKey(IDL.address);

export const bankrunSetup = async () => {
  try {
    const context = await startAnchor(
      "",
      [
        {
          name: "chaubet",
          programId: PROGRAM_ID,
        },
      ],
      [
        {
          address: admin.publicKey,
          info: {
            data: Buffer.alloc(0),
            executable: false,
            lamports: anchor.web3.LAMPORTS_PER_SOL * 5000,
            owner: anchor.web3.SystemProgram.programId,
          },
        },
        {
          address: admin_two.publicKey,
          info: {
            data: Buffer.alloc(0),
            executable: false,
            lamports: anchor.web3.LAMPORTS_PER_SOL * 5000,
            owner: anchor.web3.SystemProgram.programId,
          },
        },
        {
          address: admin_three.publicKey,
          info: {
            data: Buffer.alloc(0),
            executable: false,
            lamports: anchor.web3.LAMPORTS_PER_SOL * 5000,
            owner: anchor.web3.SystemProgram.programId,
          },
        },
        {
          address: bettor_one.publicKey,
          info: {
            data: Buffer.alloc(0),
            executable: false,
            lamports: anchor.web3.LAMPORTS_PER_SOL * 30,
            owner: anchor.web3.SystemProgram.programId,
          },
        },
        {
          address: bettor_two.publicKey,
          info: {
            data: Buffer.alloc(0),
            executable: false,
            lamports: anchor.web3.LAMPORTS_PER_SOL * 30,
            owner: anchor.web3.SystemProgram.programId,
          },
        },
        {
          address: malicious_guy.publicKey,
          info: {
            data: Buffer.alloc(0),
            executable: false,
            lamports: anchor.web3.LAMPORTS_PER_SOL * 3000,
            owner: anchor.web3.SystemProgram.programId,
          },
        },
      ]
    );

    const provider = new BankrunProvider(context);
    const bankClient = context.banksClient;

    const program = new anchor.Program<Chaubet>(IDL as Chaubet, provider);

    // all admin context accounts
    const adminIContext = getAccount(admin, context);
    const adminTwoIContext = getAccount(admin_two, context);
    const adminThreeIContext = getAccount(admin_three, context);

    // all bettor context accounts
    const bettorOneIContext = getAccount(bettor_one, context);
    const bettorTwoIContext = getAccount(bettor_two, context);

    // malicious guy context account
    const maliciousGuyIContext = getAccount(malicious_guy, context);

    return {
      context,
      provider,

      bankClient,
      program,

      adminIContext,
      adminTwoIContext,
      adminThreeIContext,

      bettorOneIContext,
      bettorTwoIContext,

      maliciousGuyIContext,
    };
  } catch (error) {
    throw new Error(
      ` You got an error while trying to setup the bank server:- ${error} `
    );
  }
};

const getAccount = (
  keypair: anchor.web3.Keypair,
  context: ProgramTestContext
) => {
  try {
    const provider = new BankrunProvider(context);

    // swithcing provider default wallet to given keypair
    provider.wallet = new NodeWallet(keypair);

    const program = new anchor.Program<Chaubet>(IDL as Chaubet, provider);

    const accounts: IContextAccount = {
      provider: provider,
      keypair: keypair,
      program: program,
    };

    return accounts;
  } catch (error) {
    throw new Error(
      `You got an error while trying to make an account(file name:- setup.ts) ${error}`
    );
  }
};
