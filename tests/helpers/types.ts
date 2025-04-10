import * as anchor from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import { Chaubet } from "../../target/types/chaubet";
import { BanksClient, ProgramTestContext } from "solana-bankrun";

export interface IContextAccount {
  keypair: anchor.web3.Keypair;
  provider: BankrunProvider;
  program: anchor.Program<Chaubet>;
}

export interface Actors {
  admin: {
    one: IContextAccount;
    two: IContextAccount;
    three: IContextAccount;
  };

  bettor: {
    one: IContextAccount;
    two: IContextAccount;
  };

  malicious: IContextAccount;
}

export interface Accounts {
  mint: {
    yes: anchor.web3.PublicKey;
    no: anchor.web3.PublicKey;
  };

  bettor: {
    oneWager: anchor.web3.PublicKey;
    twoWager: anchor.web3.PublicKey;

    oneProfile: anchor.web3.PublicKey;
    twoProfile: anchor.web3.PublicKey;

    oneVault: anchor.web3.PublicKey;
    twoVault: anchor.web3.PublicKey;
  };

  bettorATA: {
    oneYes: anchor.web3.PublicKey;
    oneNo: anchor.web3.PublicKey;

    twoYes: anchor.web3.PublicKey;
    twoNo: anchor.web3.PublicKey;
  };

  market: {
    chauMarket: anchor.web3.PublicKey;
    chauMarketVault: anchor.web3.PublicKey;
  };

  config: {
    chauConfig: anchor.web3.PublicKey;
    chauTreasury: anchor.web3.PublicKey;
  };
}

interface BankConfig {
  client: BanksClient;
  context: ProgramTestContext;
}

export type TestSetupType = Actors & Accounts & BankConfig;

export type InitConfigType = {
  name: string;
  fees: number;
};
