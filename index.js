require("dotenv").config();
const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");

const bot = new Telegraf(process.env.BOT_TOKEN);

// === START ===
bot.start((ctx) => {
  ctx.reply("👋 Welcome to FOOTBOT-MASTER!\nClick below to open the Mini App:", {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 Open Mini App", web_app: { url: "https://footbot-server.onrender.com" } }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
});

// === Reply to all messages with Mini App Button ===
bot.on("message", (ctx) => {
  ctx.reply("👇 Tap to open the Mini App:", {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 Open Mini App", web_app: { url: "https://footbot-server.onrender.com" } }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
});

// === Launch Bot ===
bot.launch();
console.log("✅ FOOTBOT-MASTER is running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));