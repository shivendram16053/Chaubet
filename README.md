# Chaubet 🔮

Chaubet is a decentralized prediction market based on LMSR (Logarithmic Market Scoring Rule) and build on Solana, where you can place predictions on active markets. If your prediction is correct based on Grok AI resolution, you earn rewards based on the market price.

[deployed link](https://solscan.io/account/ABUkyE3f3pyBeyS9YGtdKTHMKYHATSroW7S6u8JxNxaP?cluster=devnet)

<div>
<img src="https://github.com/user-attachments/assets/21377e09-7d59-4ac0-9aaa-433057c11a01" alt="shakuni in a jacket" width="300" height="400">

</div>


# Overview
On Chaubet, you can trade predictions related to crypto,politics,anime,movies turning your market insights into impactful strategies.These markets where specifically focused in Indian events.we ensure that every trade is fast, secure, and transparent, leveraging Solana's advanced infrastructure.
You can also get engage with your fellow bettors for each given market. 

## Problem:
1) Traditional Order Book Model:-
  - Most prediction markets use an order book model, where a matching engine connects buyers and sellers.
  - In this model, users must place limit or market orders, and they often have to wait for a counterparty to match their order before a trade is executed.
  - This can lead to low liquidity, longer wait times, and a less seamless trading experience, especially in less active markets.
2) AMM(Automated Market Making) Model:-
 - While AMMs solve the liquidity issue by allowing users to trade against a liquidity pool, they typically rely on constant product or bonding curve formulas, which 
  aren't always ideal for binary outcomes like prediction markets.
 - These models can introduce price slippage, especially during high-volume trades or in volatile markets.
 - Additionally, impermanent loss and the need for external liquidity providers can complicate the user experience and market dynamics.

## Solution: 
We are adopting the Logarithmic Market Scoring Rule, a methodology developed by economist Robin Hanson and widely recognized as a benchmark for automated market makers in prediction markets. Distinct from traditional frameworks that depend on pairing buyers and sellers, LMSR enables us to facilitate continuous trading by serving as the counterparty to each transaction. This approach ensures dynamic price adjustments based on the volume of shares acquired for each potential outcome, thereby maintaining liquidity and encouraging accurate forecasting.

    
## How Chaubet Works:-
1) A market is created based on a real-world event <br/>
*Example*: Will Modi visit Manipur by the end of April 2025?

3) Chaubet is a binary outcome prediction market, meaning you can choose between two straightforward outcomes (or shares) to buy:

- YES: Predict that the event will happen. If you're correct, you'll earn rewards based on the accuracy and timing of your prediction.

-  NO: Predict that the event won’t happen. If you're right, you'll earn rewards proportional to the overall outcome.  <br/>
  
    Bettor will place there bets based on the reasearch they have made. If bettors buy more YES shares then Price of YES shares increases Logerthimcally, and Price of NO shares will be decresed

     Bettor can also trade there shares btween the time frame of Event lifecycle.

3) Resolution
  - Tuk-Tuk schedules a cron job to trigger Switchboard’s at the market’s close (April 30, 2025).
  - Switchboard queries the Grok API, which analyzes news, government reports, or other reliable sources to determine if Modi visited Manipur.
  - After event got resolved the losing side pays the winners and payment for the winner will given as no.of winning shares they have(SOL per Share), meaning that when a market closes, the winners receive an amount of SOL equivalent to no of winning outcome shares they have.

## Oracle integration with Grok API:- 
- We use Switchboard, a flexible oracle solution, to create custom data feeds for Chaubet’s resolution data.
- To automate and schedule data updates, we employ Tuk-Tuk, a Solana-native cron job scheduler. Tuk-Tuk triggers our Switchboard data feeds at regular intervals or specific times, ensuring timely resolution of market events.
- We integrate the Grok API, provided by xAI, as the endpoint for our Switchboard oracles to fetch binary outcome data.

  <img width="700" height="400" alt="Screenshot 2025-04-18 at 1 01 15 AM" src="https://github.com/user-attachments/assets/a1d50897-6d36-4b26-b16b-5b0a910cf947" />

## Features:-
1) Onchain buying/trading outcome shares of a given market.
2) Automated Outcome Resolution with Switchboard Oracle and Grok API.
3) Cron Job Automation with Tuk-Tuk.
4) Clean user friendly UI/UX.
5) Chat application for each specific market.


## Tech Stack:-
- Blockchain: Solana
- Smartcontract: Anchor Framework
- Testing: Bankrun and Jest
- Frontend: NextJs(modern frontend framework),Typescript(robust types),Motion(for sleek UI),websockets(for chat-application)

  ## Progress:-
  - Smartcontract ✅
  - Testing ✅
  - Frontend 🏗️
 
  ## Roadmap
  1) By the end of Q1 ✅
     - complete the smart-contract
     - complete the end to end testing
       
  2) By the end of Q2 🏗️
     - New feature parlay betting. 
     - Integrate Grok API and CRON JOB setup.

  4) By the end of Q3 🏗️
     - complete the frontend design
     - Intergrate the Web Sockets
     - Intergrate the Blinks

    5) By the end of Q4 🏗️
       - Deploy it on mainnet
       - Onboard the users


### For more indepth Technical analysis vist our Chaubet Blog:- 
[chaubet_notion](https://marvelous-thorium-112.notion.site/Chaubet-1bdc5b64461280cfb6efe749d16bf833)



