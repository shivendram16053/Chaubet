import { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { Chaubet } from "../../target/types/chaubet";

export async function fetchProgramDerivedAccounts(
  program: Program<Chaubet>,
  chauMarketPDA: anchor.web3.PublicKey,
  chauConfigPDA: anchor.web3.PublicKey
) {
  try {
    return {
      chauMarketAccount: await program.account.chauMarket.fetch(chauMarketPDA),
      chauConfigAccount: await program.account.chauConfig.fetch(chauConfigPDA),
    };
  } catch (error) {
    console.error(`Error fetching Program Derived Accounts (PDAs): ${error}`);
    throw error;
  }
}
