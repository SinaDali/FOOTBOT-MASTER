const { Telegraf } = require("telegraf");
const fs = require("fs");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");

// Load environment variables
dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Telegram commands
bot.start((ctx) => {
  ctx.reply("👋 Welcome to FOOTBOT-MASTER", {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "📊 Open Mini App",
          web_app: { url: "https://footbot-server.onrender.com" },
        },
      ]],
    },
  });
});

// Start the bot
bot.launch();
console.log("✅ FOOTBOT-MASTER bot is running...");

// Express server for Render Mini App
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from webapp folder
app.use(express.static(path.join(__dirname, "webapp")));

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌐 Mini App server is running on port ${PORT}`);
});