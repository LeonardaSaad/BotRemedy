const { Client, GatewayIntentBits } = require("discord.js");
const { token, userId, reminderCron } = require("./config");
const { startScheduler } = require("./services/scheduleService");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessagePolls,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("clientReady", () => {
  console.log(`✅ Bot logado como ${client.user.tag}`);
  startScheduler(client, userId, reminderCron);
});


client.login(token);