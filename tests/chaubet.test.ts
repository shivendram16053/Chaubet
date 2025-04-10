import { describe, test, beforeAll } from "@jest/globals";
import { InitConfigType, TestSetupType } from "./helpers/types";
import { bankrunSetup } from "./helpers/setup";
import {
  getAllATA,
  getAllMint,
  getAllPDA,
  makeTransaction,
} from "./helpers/helper";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { BanksTransactionResultWithMeta } from "solana-bankrun";

describe("chaubet", () => {
  const testSetup: TestSetupType = {
    admin: {},
    bettor: {},
    bettorATA: {},
    mint: {},
    config: {},
    market: {},
  } as TestSetupType;

  beforeAll(async () => {
    try {
      // Bankrun setup
      const bankrunRes = await bankrunSetup();

      testSetup.client = bankrunRes.bankClient;
      testSetup.context = bankrunRes.context;

      testSetup.admin.one = bankrunRes.adminIContext;
      testSetup.admin.two = bankrunRes.adminTwoIContext;
      testSetup.admin.three = bankrunRes.adminThreeIContext;

      testSetup.bettor.one = bankrunRes.bettorOneIContext;
      testSetup.bettor.two = bankrunRes.bettorTwoIContext;

      testSetup.malicious = bankrunRes.maliciousGuyIContext;

      const PDAAccounts = getAllPDA();

      // bettor setup
      testSetup.bettor.oneVault = PDAAccounts.bettorOneVaultAccount;
      testSetup.bettor.twoVault = PDAAccounts.bettorTwoVaultAccount;

      testSetup.bettor.oneWager = PDAAccounts.wagerOneAccount;
      testSetup.bettor.twoWager = PDAAccounts.wagerTwoAccount;

      testSetup.bettor.oneProfile = PDAAccounts.bettorOneProfile;
      testSetup.bettor.twoProfile = PDAAccounts.bettorTwoProfile;

      // chauConfig
      testSetup.config.chauConfig = PDAAccounts.chauConfig;
      testSetup.config.chauTreasury = PDAAccounts.treasuryAccount;

      //market
      testSetup.market.chauMarket = PDAAccounts.chauMarket;
      testSetup.market.chauMarketVault = PDAAccounts.marketVaultAccount;

      const mintAcc = await getAllMint(
        testSetup.client,
        testSetup.config.chauConfig
      );

      testSetup.mint.yes = mintAcc.mint_yes.publicKey;
      testSetup.mint.no = mintAcc.mint_no.publicKey;

      const ATAAcc = await getAllATA(
        testSetup.mint.yes,
        testSetup.mint.no,
        testSetup.client
      );

      testSetup.bettorATA.oneYes = ATAAcc.bettorOneYesATA;
      testSetup.bettorATA.oneNo = ATAAcc.bettorOneNoATA;

      testSetup.bettorATA.twoYes = ATAAcc.bettorTwoYesATA;
      testSetup.bettorATA.twoNo = ATAAcc.bettorTwoNoATA;

      console.log(`😭 The setup for testing is Done ✨`);
    } catch (error) {
      throw new Error(
        `You got an error while setting up the test cases ${error}`
      );
    }
  });

  describe("Test case for the first instruction(invoking the config)", () => {
    // upload 3 admins

    let testCases: InitConfigType[] = [
      {
        name: "First Admin",
        fees: 100,
      },
      {
        name: "Second Admin",
        fees: 200,
      },
      {
        name: "Third Admin",
        fees: null,
      },
      {
        name: "malicious Guy who is trying to access the Admin instruction",
        fees: null,
      },
    ];

    testCases.forEach((testCase, index) => {
      test(`${testCase.name} config invokation`, async () => {
        try {
          switch (index) {
            case 0: {
              let ix = await testSetup.admin.one.program.methods
                .initializeConfig(testCase.fees)
                .accountsStrict({
                  admin: testSetup.admin.one.keypair.publicKey,
                  chauConfig: testSetup.config.chauConfig,
                  treasuryAccount: testSetup.config.chauTreasury,
                  systemProgram: SYSTEM_PROGRAM_ID,
                })
                .instruction();

              let trxRes = await makeTransaction(
                testSetup.client,
                [ix],
                [testSetup.admin.one.keypair],
                false
              );

              console.log(
                `The testcase by ${testCase.name} is passed 🥳 and res:- ${trxRes}`
              );

              break;
            }
            case 1: {
              let ix = await testSetup.admin.two.program.methods
                .initializeConfig(testCase.fees)
                .accountsStrict({
                  admin: testSetup.admin.two.keypair.publicKey,
                  chauConfig: testSetup.config.chauConfig,
                  treasuryAccount: testSetup.config.chauTreasury,
                  systemProgram: SYSTEM_PROGRAM_ID,
                })
                .instruction();

              let trxRes = await makeTransaction(
                testSetup.client,
                [ix],
                [testSetup.admin.two.keypair],
                false
              );

              console.log(
                `The testcase by ${testCase.name} is passed 🥳 and res:- ${trxRes}`
              );
              break;
            }

            case 3: {
              let ix = await testSetup.admin.three.program.methods
                .initializeConfig(testCase.fees)
                .accountsStrict({
                  admin: testSetup.admin.three.keypair.publicKey,
                  chauConfig: testSetup.config.chauConfig,
                  treasuryAccount: testSetup.config.chauTreasury,
                  systemProgram: SYSTEM_PROGRAM_ID,
                })
                .instruction();

              let trxRes = await makeTransaction(
                testSetup.client,
                [ix],
                [testSetup.admin.three.keypair],
                false
              );

              console.log(
                `The testcase by ${testCase.name} is passed 🥳 and res:- ${trxRes}`
              );
              break;
            }

            case 4: {
              let ix = await testSetup.malicious.program.methods
                .initializeConfig(testCase.fees)
                .accountsStrict({
                  admin: testSetup.malicious.keypair.publicKey,
                  chauConfig: testSetup.config.chauConfig,
                  treasuryAccount: testSetup.config.chauTreasury,
                  systemProgram: SYSTEM_PROGRAM_ID,
                })
                .instruction();

              let trxRes: BanksTransactionResultWithMeta =
                (await makeTransaction(
                  testSetup.client,
                  [ix],
                  [testSetup.malicious.keypair],
                  true
                )) as BanksTransactionResultWithMeta;

              break;
            }
          }
        } catch (error) {
          throw new Error(
            `🔥 You got an error while testing first instruction ${error}`
          );
        }
      });
    });
  });
});
