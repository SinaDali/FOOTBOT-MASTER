require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ✅ دستور /start برای نمایش دکمه Mini App
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

// ✅ نمایش دکمه Mini App برای هر پیام متنی از کاربر
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

// ✅ اجرای بات
bot.launch();
console.log("✅ FOOTBOT-MASTER is running...");
const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files from webapp folder
app.use(express.static(path.join(__dirname, "webapp")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});