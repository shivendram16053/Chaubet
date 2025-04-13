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
import { BN } from "bn.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { fetchProgramDerivedAccounts } from "./helpers/accounts";

describe("chaubet", () => {
  const testSetup: TestSetupType = {
    admin: {},
    bettor: {},
    bettorAccounts: {},
    bettorATA: {},
    maliciousATA: {},
    maliciousAccounts: {},
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

      const PDAAccounts = getAllPDA(
        "will Modi go to manipur by the end of 2025 ?"
      );

      // bettor setup
      testSetup.bettorAccounts.oneVault = PDAAccounts.bettorOneVaultAccount;
      testSetup.bettorAccounts.twoVault = PDAAccounts.bettorTwoVaultAccount;

      testSetup.bettorAccounts.oneWager = PDAAccounts.wagerOneAccount;
      testSetup.bettorAccounts.twoWager = PDAAccounts.wagerTwoAccount;

      testSetup.bettorAccounts.oneProfile = PDAAccounts.bettorOneProfile;
      testSetup.bettorAccounts.twoProfile = PDAAccounts.bettorTwoProfile;

      // malicious setup
      testSetup.maliciousAccounts.profile = PDAAccounts.maliciousProfile;
      testSetup.maliciousAccounts.wager = PDAAccounts.maliciousWagerAccount;
      testSetup.maliciousAccounts.vault = PDAAccounts.maliciousGuyVaultAccount;

      // chauConfig
      testSetup.config.chauConfig = PDAAccounts.chauConfig;
      testSetup.config.chauTreasury = PDAAccounts.treasuryAccount;

      testSetup.market.chauMarket = PDAAccounts.chauMarket;
      testSetup.market.chauMarketVault = PDAAccounts.marketVaultAccount;

      // Initialize mints first, passing client and authority
      const mintAcc = await getAllMint(
        // testSetup.client,
        testSetup.market.chauMarket
      );

      testSetup.mint.yes = mintAcc.mintYes;
      testSetup.mint.no = mintAcc.mintNo;

      const ATAAcc = await getAllATA(testSetup.mint.yes, testSetup.mint.no);

      testSetup.bettorATA.oneYes = ATAAcc.bettorOneYesATA;
      testSetup.bettorATA.oneNo = ATAAcc.bettorOneNoATA;

      testSetup.bettorATA.twoYes = ATAAcc.bettorTwoYesATA;
      testSetup.bettorATA.twoNo = ATAAcc.bettorTwoNoATA;

      testSetup.maliciousATA.yes = ATAAcc.maliciousYesATA;
      testSetup.maliciousATA.no = ATAAcc.maliciousNoATA;

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
      // {
      //   name: "malicious Guy who is trying to access the Admin instruction",
      //   fees: null,
      // },
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

              await makeTransaction(
                testSetup.client,
                [ix],
                [testSetup.malicious.keypair],
                true
              );

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

  describe("Test case for creating Bettor Profile and Vault Account", () => {
    // 2 bettor profiles and 1 malicious guy so we have to run 3 test-cases

    const testCases = [
      {
        name: "rahul",
        amount: 10,
      },
      {
        name: "pranay",
        amount: 10,
      },
      {
        name: "vivek(malicious guy)",
        amount: 10,
      },
    ];

    testCases.forEach((bettorInfo, index) => {
      test(`${bettorInfo.name} is invoking his bettor profile`, async () => {
        try {
          switch (index) {
            case 0: {
              const ix = await testSetup.bettor.one.program.methods
                .initializeBettorAccount(
                  new BN(bettorInfo.amount),
                  bettorInfo.name
                )
                .accountsStrict({
                  bettor: testSetup.bettor.one.keypair.publicKey,
                  bettorProfile: testSetup.bettorAccounts.oneProfile,
                  bettorWalletAccount: testSetup.bettorAccounts.oneVault,
                  chauConfig: testSetup.config.chauConfig,
                  systemProgram: SYSTEM_PROGRAM_ID,
                })
                .instruction();

              await makeTransaction(
                testSetup.client,
                [ix],
                [testSetup.bettor.one.keypair],
                false
              );

              console.log(
                `${bettorInfo.name} has successfully created his bettor profile 🥂`
              );
              break;
            }
            case 1: {
              const ix = await testSetup.bettor.two.program.methods
                .initializeBettorAccount(
                  new BN(bettorInfo.amount),
                  bettorInfo.name
                )
                .accountsStrict({
                  bettor: testSetup.bettor.two.keypair.publicKey,
                  bettorProfile: testSetup.bettorAccounts.twoProfile,
                  bettorWalletAccount: testSetup.bettorAccounts.twoVault,
                  chauConfig: testSetup.config.chauConfig,
                  systemProgram: SYSTEM_PROGRAM_ID,
                })
                .instruction();

              await makeTransaction(
                testSetup.client,
                [ix],
                [testSetup.bettor.two.keypair],
                false
              );

              console.log(
                `${bettorInfo.name} has successfully created his bettor profile 🥂`
              );

              break;
            }
            case 2: {
              const ix = await testSetup.malicious.program.methods
                .initializeBettorAccount(
                  new BN(bettorInfo.amount),
                  bettorInfo.name
                )
                .accountsStrict({
                  bettor: testSetup.malicious.keypair.publicKey,
                  bettorProfile: testSetup.maliciousAccounts.profile,
                  bettorWalletAccount: testSetup.maliciousAccounts.vault,
                  chauConfig: testSetup.config.chauConfig,
                  systemProgram: SYSTEM_PROGRAM_ID,
                })
                .instruction();

              await makeTransaction(
                testSetup.client,
                [ix],
                [testSetup.malicious.keypair],
                false
              );

              console.log(
                `${bettorInfo.name} has successfully created his bettor profile 🥂`
              );

              break;
            }
          }
        } catch (error) {
          throw new Error(
            `${bettorInfo.name} got an error while his is invoking his profile ${error}`
          );
        }
      });
    });
  });

  describe("Testing for creating market account", () => {
    test(`test for creating market`, async () => {
      // one month in Seconds
      let one_month = 2_592_000;

      let market = {
        name: "Real Admin One",
        testArg: {
          marketName: "will Modi go to manipur by the end of 2025 ?",
          marketDes:
            "It’s unclear if Narendra Modi will visit Manipur by late 2025. Ethnic clashes between Meitei and Kuki groups since May 2023 have killed over 200 and displaced 50,000. Congress critics say Modi has ignored the crisis, despite global travels. He addressed it in August 2023 but hasn’t visited as of April 2025. A visit might show commitment, but his focus on diplomacy may delay it.",

          lmsrB: 2000,
          deadLine: 8 * one_month,
        },
      };

      let currentUnix = (await testSetup.client.getClock()).unixTimestamp;
      let dead_line = new BN(market.testArg.deadLine + Number(currentUnix));

      try {
        let ix = await testSetup.admin.one.program.methods
          .createMarket({
            name: market.testArg.marketName,
            description: market.testArg.marketDes,
            lmsrB: new BN(market.testArg.lmsrB),
            deadLine: dead_line,
          })
          .accountsStrict({
            admin: testSetup.admin.one.keypair.publicKey,
            marketVaultAccount: testSetup.market.chauMarketVault,
            chauMarket: testSetup.market.chauMarket,

            chauConfig: testSetup.config.chauConfig,

            mintYes: testSetup.mint.yes,
            mintNo: testSetup.mint.no,

            systemProgram: SYSTEM_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction();

        await makeTransaction(
          testSetup.client,
          [ix],
          [testSetup.admin.one.keypair],
          false
        );

        const accounts = await fetchProgramDerivedAccounts(
          testSetup.admin.one.program,
          testSetup.market.chauMarket,
          testSetup.config.chauConfig
        );

        console.log(
          `ChauMarket details:- 1) marketName: ${
            accounts.chauMarketAccount.marketName
          } and 2)LMSR_B: ${accounts.chauMarketAccount.lsmrB.toNumber()}`
        );

        console.log(`market is successfully created by ${market.name} 🔥`);
      } catch (error) {
        throw new Error(
          `You got an error while creating an new account ${error}`
        );
      }
    });
  });

  describe("Its time to buy some tokens", () => {
    test("Buying Yes Shares", async () => {
      try {
        let ix = await testSetup.bettor.one.program.methods
          .buyShares(new BN(10), true)
          .accountsStrict({
            bettor: testSetup.bettor.one.keypair.publicKey,

            bettorYesAccount: testSetup.bettorATA.oneYes,
            bettorNoAccount: testSetup.bettorATA.oneNo,

            bettorProfile: testSetup.bettorAccounts.oneProfile,
            bettorWalletAccount: testSetup.bettorAccounts.oneVault,
            wagerAccount: testSetup.bettorAccounts.oneWager,

            chauMarket: testSetup.market.chauMarket,
            marketVaultAccount: testSetup.market.chauMarketVault,

            mintYes: testSetup.mint.yes,
            mintNo: testSetup.mint.no,

            chauConfig: testSetup.config.chauConfig,

            systemProgram: SYSTEM_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          })
          .instruction();

        await makeTransaction(
          testSetup.client,
          [ix],
          [testSetup.bettor.one.keypair],
          true
        );

        console.log(`Yukataaaaa successfully bought outcome share 😭`);
      } catch (error) {
        throw new Error(`You got an error while buying shares ${error}`);
      }
    });
  });
});
