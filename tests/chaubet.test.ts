import { describe, test, beforeAll, expect } from "@jest/globals";
import { InitConfigType, TestSetupType, TradeType } from "./helpers/types";
import { bankrunSetup } from "./helpers/setup";
import {
  getAllATA,
  getAllMint,
  getAllPDA,
  makeTimeTravle,
  makeTransaction,
} from "./helpers/helper";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { BN } from "bn.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  fetchBettorProfile,
  fetchProgramDerivedAccounts,
  fetchWagerPDA,
  getAccount,
} from "./helpers/accounts";
import {
  ComputeBudgetProgram,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

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
        fees: null,
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
        amount: 50,
      },
      {
        name: "pranay",
        amount: 50,
      },
      {
        name: "vivek(malicious guy)",
        amount: 100,
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
          `✨ ChauMarket details:- 1) marketName: ${
            accounts.chauMarketAccount.marketName
          } and 2)LMSR_B: ${accounts.chauMarketAccount.lsmrB.toNumber()} 3) The initialDeposite: ${
            accounts.chauMarketAccount.intialDeposite
          } ✨`
        );

        console.log(`market is successfully created by ${market.name} 🔥`);
      } catch (error) {
        throw new Error(
          `You got an error while creating an new account ${error}`
        );
      }
    });
  });

  describe("Its time to trade some tokens", () => {
    let buyingTest: TradeType[] = [
      {
        name: "Bettor One",
        amount: 20,
        isYes: true,
        isBuy: true,
        bettor: 0,
      },
      {
        name: "Bettor Two",
        amount: 7,
        isYes: false,
        isBuy: true,
        bettor: 1,
      },
      {
        name: "malicious guy",
        amount: 4,
        isYes: false,
        isBuy: true,
        bettor: 2,
      },
      {
        name: "Bettor One",
        amount: 10,
        isYes: true,
        isBuy: false,
        bettor: 0,
      },

      {
        name: "Bettor Two",
        amount: 10,
        isYes: true,
        isBuy: true,
        bettor: 1,
      },

      {
        name: "malicious guy",
        amount: 4,
        isYes: false,
        isBuy: false,
        bettor: 2,
      },
    ];

    buyingTest.forEach((testInfo) => {
      test(`${testInfo.name} is ${testInfo.isBuy ? "Buying" : "Selling"} ${
        testInfo.isYes ? "YES" : "NO"
      } Shares`, async () => {
        try {
          // Create a compute budget instruction to increase the compute unit limit
          // This is needed because the buyShares instruction uses complex math operations (exp, ln)
          // that require more compute units than the default limit
          const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
            units: 500000, // Increase from default 200,000 to 500,000
          });

          switch (testInfo.bettor) {
            case 0: {
              let tradeShareIx: TransactionInstruction;

              if (testInfo.isBuy) {
                tradeShareIx = await testSetup.bettor.one.program.methods
                  .buyShares(new BN(testInfo.amount), testInfo.isYes)
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
              } else {
                tradeShareIx = await testSetup.bettor.one.program.methods
                  .sellShares(new BN(testInfo.amount), testInfo.isYes)
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
              }

              let trxMets = await makeTransaction(
                testSetup.client,
                [computeBudgetIx, tradeShareIx], // Add compute budget instruction first
                [testSetup.bettor.one.keypair],
                false // Changed to false since we expect it to succeed with the higher compute budget
              );

              console.log(
                `The given trsaction CU is ${trxMets.computeUnitsConsumed}`
              );

              let wagerAcc = await fetchWagerPDA(
                testSetup.bettor.one.program,
                testSetup.bettorAccounts.oneWager
              );

              let chauMarketAcc = await fetchProgramDerivedAccounts(
                testSetup.bettor.one.program,
                testSetup.market.chauMarket,
                testSetup.config.chauConfig
              );

              console.log(
                `✨ ${testInfo.name}:-  The wager Account destructuring 1) YES Shares:- ${wagerAcc.yesShares} 2) NO Shares:- ${wagerAcc.noShares} 3) Amount Spent ${wagerAcc.betAmountSpent} ✨`
              );

              console.log(
                `✨ The ChauMarket account destructuring 1) Total YES Shares ${chauMarketAcc.chauMarketAccount.outcomeYesShares}  2)Total NoShares ${chauMarketAcc.chauMarketAccount.outcomeNoShares} `
              );

              break;
            }
            case 1: {
              let tradeShareIx: TransactionInstruction;

              if (testInfo.isBuy) {
                tradeShareIx = await testSetup.bettor.two.program.methods
                  .buyShares(new BN(testInfo.amount), testInfo.isYes)
                  .accountsStrict({
                    bettor: testSetup.bettor.two.keypair.publicKey,

                    bettorYesAccount: testSetup.bettorATA.twoYes,
                    bettorNoAccount: testSetup.bettorATA.twoNo,

                    bettorProfile: testSetup.bettorAccounts.twoProfile,
                    bettorWalletAccount: testSetup.bettorAccounts.twoVault,
                    wagerAccount: testSetup.bettorAccounts.twoWager,

                    chauMarket: testSetup.market.chauMarket,
                    marketVaultAccount: testSetup.market.chauMarketVault,

                    mintYes: testSetup.mint.yes,
                    mintNo: testSetup.mint.no,

                    chauConfig: testSetup.config.chauConfig,

                    systemProgram: SYSTEM_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
                  })
                  .signers([testSetup.bettor.two.keypair])
                  .instruction();
              } else {
                tradeShareIx = await testSetup.bettor.two.program.methods
                  .sellShares(new BN(testInfo.amount), testInfo.isYes)
                  .accountsStrict({
                    bettor: testSetup.bettor.two.keypair.publicKey,

                    bettorYesAccount: testSetup.bettorATA.twoYes,
                    bettorNoAccount: testSetup.bettorATA.twoNo,

                    bettorProfile: testSetup.bettorAccounts.twoProfile,
                    bettorWalletAccount: testSetup.bettorAccounts.twoVault,
                    wagerAccount: testSetup.bettorAccounts.twoWager,

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
              }

              let trxMets = await makeTransaction(
                testSetup.client,
                [computeBudgetIx, tradeShareIx], // Add compute budget instruction first
                [testSetup.bettor.two.keypair],
                false // Changed to false since we expect it to succeed with the higher compute budget
              );

              console.log(
                `The given trsaction CU is ${trxMets.computeUnitsConsumed}`
              );

              let wagerAcc = await fetchWagerPDA(
                testSetup.bettor.two.program,
                testSetup.bettorAccounts.twoWager
              );

              let chauMarketAcc = await fetchProgramDerivedAccounts(
                testSetup.bettor.two.program,
                testSetup.market.chauMarket,
                testSetup.config.chauConfig
              );

              console.log(
                `✨ ${testInfo.name}:-  The wager Account destructuring 1) YES Shares:- ${wagerAcc.yesShares} 2) NO Shares:- ${wagerAcc.noShares} 3) Amount Spent ${wagerAcc.betAmountSpent} ✨`
              );

              console.log(
                `✨ The ChauMarket account destructuring 1) Total YES Shares ${chauMarketAcc.chauMarketAccount.outcomeYesShares}  2)Total NoShares ${chauMarketAcc.chauMarketAccount.outcomeNoShares} `
              );

              break;
            }
            case 2: {
              let tradeShareIx: TransactionInstruction;
              if (testInfo.isBuy) {
                tradeShareIx = await testSetup.malicious.program.methods
                  .buyShares(new BN(testInfo.amount), testInfo.isYes)
                  .accountsStrict({
                    bettor: testSetup.malicious.keypair.publicKey,

                    bettorYesAccount: testSetup.maliciousATA.yes,
                    bettorNoAccount: testSetup.maliciousATA.no,

                    bettorProfile: testSetup.maliciousAccounts.profile,
                    bettorWalletAccount: testSetup.maliciousAccounts.vault,
                    wagerAccount: testSetup.maliciousAccounts.wager,

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
              } else {
                tradeShareIx = await testSetup.malicious.program.methods
                  .sellShares(new BN(testInfo.amount), testInfo.isYes)
                  .accountsStrict({
                    bettor: testSetup.malicious.keypair.publicKey,

                    bettorYesAccount: testSetup.maliciousATA.yes,
                    bettorNoAccount: testSetup.maliciousATA.no,

                    bettorProfile: testSetup.maliciousAccounts.profile,
                    bettorWalletAccount: testSetup.maliciousAccounts.vault,
                    wagerAccount: testSetup.maliciousAccounts.wager,

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
              }

              let trxMets = await makeTransaction(
                testSetup.client,
                [computeBudgetIx, tradeShareIx], // Add compute budget instruction first
                [testSetup.malicious.keypair],
                false // Changed to false since we expect it to succeed with the higher compute budget
              );

              console.log(
                `The given trsaction CU is ${trxMets.computeUnitsConsumed}`
              );

              let wagerAcc = await fetchWagerPDA(
                testSetup.malicious.program,
                testSetup.maliciousAccounts.wager
              );

              let chauMarketAcc = await fetchProgramDerivedAccounts(
                testSetup.malicious.program,
                testSetup.market.chauMarket,
                testSetup.config.chauConfig
              );

              console.log(
                `✨ ${testInfo.name}:-  The wager Account destructuring 1) YES Shares:- ${wagerAcc.yesShares} 2) NO Shares:- ${wagerAcc.noShares} 3) Amount Spent ${wagerAcc.betAmountSpent} ✨`
              );

              console.log(
                `✨ The ChauMarket account destructuring 1) Total YES Shares ${chauMarketAcc.chauMarketAccount.outcomeYesShares}  2)Total NoShares ${chauMarketAcc.chauMarketAccount.outcomeNoShares} `
              );

              break;
            }
          }
        } catch (error) {
          throw new Error(`You got an error while buying shares ${error}`);
        }
      });
    });
  });

  describe("Lets ban this guy", () => {
    test("Banning malicious guy", async () => {
      try {
        let ix = await testSetup.admin.one.program.methods
          .banBettor()
          .accountsStrict({
            admin: testSetup.admin.one.keypair.publicKey,
            bettor: testSetup.malicious.keypair.publicKey,
            chauConfig: testSetup.config.chauConfig,

            betrorProfile: testSetup.maliciousAccounts.profile,

            systemProgram: SYSTEM_PROGRAM_ID,
          })
          .instruction();

        await makeTransaction(
          testSetup.client,
          [ix],
          [testSetup.admin.one.keypair],
          false
        );

        console.log(`successfully banned maliciousAccount`);

        const maliciousAcc = await fetchBettorProfile(
          testSetup.admin.one.program,
          testSetup.maliciousAccounts.profile
        );

        expect(maliciousAcc.isBan).toEqual(true);
      } catch (error) {
        throw new Error(`You got an error while banning this guy ${error}`);
      }
    });
  });

  describe("Resolve the market", () => {
    test("market got resolved", async () => {
      enum MarketOutcome {
        YES = 0,
        NO = 1,
        NotResolved = 2,
      }
      try {
        let one_month = 2_592_000;

        let clock = await testSetup.client.getClock();

        let addedUnixTime = clock.unixTimestamp + BigInt(9 * one_month);

        // I am time travling to 9 months ahead in future
        makeTimeTravle(testSetup.context, addedUnixTime, clock);

        let ix = await testSetup.admin.one.program.methods
          .resolveMarket({ yes: {} })
          .accountsStrict({
            admin: testSetup.admin.one.keypair.publicKey,
            chauConfig: testSetup.config.chauConfig,
            chauMarket: testSetup.market.chauMarket,
          })
          .instruction();

        await makeTransaction(
          testSetup.client,
          [ix],
          [testSetup.admin.one.keypair],
          false
        );

        console.log(`Market Resolution completed`);
      } catch (error) {
        throw new Error(`You got an error while resolving the market ${error}`);
      }
    });
  });

  describe("Claim bettor amount", () => {
    test("bettor one claim amountl claiming for his 10 shares of YES", async () => {
      try {
        let bettor_one_yes = await getAccount(
          testSetup.client,
          testSetup.bettorATA.oneYes
        );

        if (Number(bettor_one_yes.amount) != 0) {
          let ix = await testSetup.bettor.one.program.methods
            .claimBettorAmount(new BN(Number(bettor_one_yes.amount)))
            .accountsStrict({
              bettor: testSetup.bettor.one.keypair.publicKey,
              bettorYesAta: testSetup.bettorATA.oneYes,
              bettorNoAta: testSetup.bettorATA.oneNo,

              chauMarket: testSetup.market.chauMarket,
              marketVaultAccount: testSetup.market.chauMarketVault,
              chauConfig: testSetup.config.chauConfig,

              wagerAccount: testSetup.bettorAccounts.oneWager,
              bettorProfile: testSetup.bettorAccounts.oneProfile,
              bettorWalletAccount: testSetup.bettorAccounts.oneVault,

              mintYes: testSetup.mint.yes,
              mintNo: testSetup.mint.no,

              systemProgram: SYSTEM_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction();

          await makeTransaction(
            testSetup.client,
            [ix],
            [testSetup.bettor.one.keypair],
            false
          );

          let bettorProfile = await fetchBettorProfile(
            testSetup.bettor.one.program,
            testSetup.bettorAccounts.oneProfile
          );

          console.log(
            `Bettor has successfully fully claimed his amount the netProfite is ${bettorProfile.bettorNetProfit}`
          );
        }
      } catch (error) {
        throw new Error(`You got an error while claiming your reward`);
      }
    });

    test("bettor two claim amountl claiming for his 10 shares of YES", async () => {
      try {
        let bettor_two_yes = await getAccount(
          testSetup.client,
          testSetup.bettorATA.twoYes
        );

        if (Number(bettor_two_yes.amount) != 0) {
          let ix = await testSetup.bettor.one.program.methods
            .claimBettorAmount(new BN(Number(bettor_two_yes.amount)))
            .accountsStrict({
              bettor: testSetup.bettor.two.keypair.publicKey,
              bettorYesAta: testSetup.bettorATA.twoYes,
              bettorNoAta: testSetup.bettorATA.twoNo,

              chauMarket: testSetup.market.chauMarket,
              marketVaultAccount: testSetup.market.chauMarketVault,
              chauConfig: testSetup.config.chauConfig,

              wagerAccount: testSetup.bettorAccounts.twoWager,
              bettorProfile: testSetup.bettorAccounts.twoProfile,
              bettorWalletAccount: testSetup.bettorAccounts.twoVault,

              mintYes: testSetup.mint.yes,
              mintNo: testSetup.mint.no,

              systemProgram: SYSTEM_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction();

          await makeTransaction(
            testSetup.client,
            [ix],
            [testSetup.bettor.two.keypair],
            false
          );

          let bettorProfile = await fetchBettorProfile(
            testSetup.bettor.two.program,
            testSetup.bettorAccounts.oneProfile
          );

          console.log(
            `Bettor has successfully fully claimed his amount the netProfite is ${bettorProfile.bettorNetProfit}`
          );
        }
      } catch (error) {
        throw new Error(`You got an error while claiming your reward`);
      }
    });
  });

  describe("admin withdraw profite", () => {
    test("admin is taking profits", async () => {
      try {
        let ix = await testSetup.admin.one.program.methods
          .adminWithdrawProfit()
          .accountsStrict({
            admin: testSetup.admin.one.keypair.publicKey,
            chauConfig: testSetup.config.chauConfig,

            chauMarket: testSetup.market.chauMarket,
            marketVaultAccount: testSetup.market.chauMarketVault,

            treasuryAccount: testSetup.config.chauTreasury,
            systemProgram: SYSTEM_PROGRAM_ID,
          })
          .instruction();

        await makeTransaction(
          testSetup.client,
          [ix],
          [testSetup.admin.one.keypair],
          false
        );

        console.log(`successfully claimed the admin profit `);
      } catch (error) {
        throw new Error(
          `You got an error while trying to withdraw funds ${error}`
        );
      }
    });
  });

  describe("bettor withdraw profites", () => {
    test("bettor taking his funds from his wallet", async () => {
      try {
        let ix = await testSetup.bettor.one.program.methods
          .bettorWithdrawAmount()
          .accountsStrict({
            bettor: testSetup.bettor.one.keypair.publicKey,
            chauMarket: testSetup.market.chauMarket,
            chauConfig: testSetup.config.chauConfig,

            bettorProfile: testSetup.bettorAccounts.oneProfile,
            bettorWalletAccount: testSetup.bettorAccounts.oneVault,

            wagerAccount: testSetup.bettorAccounts.oneWager,
            systemProgram: SYSTEM_PROGRAM_ID,
          })
          .instruction();

        await makeTransaction(
          testSetup.client,
          [ix],
          [testSetup.bettor.one.keypair],
          false
        );

        console.log(`successfully claimed the bettor profit `);
      } catch (error) {
        throw new Error(
          `You got an error while bettor is taking his funds from wallet ${error}`
        );
      }
    });
  });
});
