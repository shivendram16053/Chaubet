# Chaubet 🔮

Chaubet is a decentralized prediction market based on LMSR (Logarithmic Market Scoring Rule) and build on Solana, where you can place predictions on active markets. If your prediction is correct based on Grok AI resolution, you earn rewards based on the market price.

<img src="https://github.com/user-attachments/assets/21377e09-7d59-4ac0-9aaa-433057c11a01" alt="shakuni in a jacket" width="300" height="400">



# Overview
On Chaubet, you can trade predictions related to crypto,politics,anime,movies turning your market insights into impactful strategies.These markets where specifically focused in Indian events.we ensure that every trade is fast, secure, and transparent, leveraging Solana's advanced infrastructure.
You can also get engage with your fellow bettors for each given market. 

## How Triad Works:-
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

### For more indepth Technical analysis vist our Chaubet Blog:- 
[chaubet_notion](https://marvelous-thorium-112.notion.site/Chaubet-1bdc5b64461280cfb6efe749d16bf833)



