# Discord bot 

## tl;dr
This bot will follow a user you specify in and out of voice channels under the name Leroy. Any time the target user speaks, the bot will play an audio clip of the infamous [Leroy Jenkins](https://www.youtube.com/watch?v=mLyOj_QD4a4) to interupt them (on repeat).



### **Prerequisites**

- [Node.JS](https://nodejs.org/en/) tested on v18
- You will need basic knowledge of node.js and how to navigate via cmd prompt or terminal.
- Setup a discord bot account and get your bot token. Instructions on this can be found [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#keeping-your-token-safe).

### **Instructions**
- **Step 1:** `npm install`
- **Step 2**: Create a file named `.env` and copy the contents of `.env.example` into the new file. Replace the placeholder TOKEN with your own.
- **Step 3**: Run `node bot.js` or using a process manager like [PM2](https://www.npmjs.com/package/pm2)
- **Step 4:** The default command prefix for the bot is `leeroy!` Running `leeroy!help` will give you all the commands necassary. Essentially the main command is `leeroy!target @(your target here)`. Also there is `leeroy!start` and `leeroy!stop`. By default he is turned on so to begin trolling your friends you should just have to target them.

This was inspired by [this bot](https://github.com/aaronr5tv/DonnieThornberryBot.git). It was made over 3 years ago and on versions that don't support mac M1 chips, and Discord doesn't support that npm version anymore either.

As a result, this got some updates and was fun to work on to mess with friends.
