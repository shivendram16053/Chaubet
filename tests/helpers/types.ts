import * as anchor from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import { Chaubet } from "../../target/types/chaubet";

export type IContextAccount = {
  keypair: anchor.web3.Keypair;
  provider: BankrunProvider;
  program: anchor.Program<Chaubet>;
};
