require("dotenv").config();
const { Telegraf } = require("telegraf");
const fs = require("fs");
const axios = require("axios");
const cron = require("node-cron");
const { v4: uuidv4 } = require("uuid");

const ADMIN_ID = 6404606219;
const bot = new Telegraf(process.env.BOT_TOKEN);

// ✅ /start
bot.start((ctx) => {
  return ctx.reply("👋 Welcome to FOOTBOT-MASTER!\nClick below to open the Mini App:", {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 Open Mini App", web_app: { url: "https://footbot-server.onrender.com" } }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    }
  });
});

// ✅ /addsignal
bot.command("addsignal", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("⛔ Only the admin can add signals.");

  const input = ctx.message.text.split(" ").slice(1).join(" ");
  const [match, date, winProb, goals, risk] = input.split("|").map(s => s.trim());

  if (!match || !date || !winProb || !goals || !risk) {
    return ctx.reply("❗ Format:\n/addsignal Team1 vs Team2 | Date | Win Probabilities | Goals | Risk");
  }

  const newSignal = { id: uuidv4(), match, date, winProb, goals, risk };

  try {
    const signals = JSON.parse(fs.readFileSync("data/signals.json"));
    signals.push(newSignal);
    fs.writeFileSync("data/signals.json", JSON.stringify(signals, null, 2));
    ctx.reply("✅ Signal added successfully!");
  } catch (err) {
    ctx.reply("❌ Error saving signal.");
  }
});

// ✅ /signal
bot.command("signal", (ctx) => {
  try {
    const signals = JSON.parse(fs.readFileSync("data/signals.json"));

    if (signals.length === 0) return ctx.reply("📭 No signals available yet.");

    let response = "📊 *Current Signals:*\n\n";
    signals.forEach((signal, index) => {
      response += `📍 *${index + 1}. ${signal.match}*\n`;
      response += `🆔 ID: ${signal.id}\n`;
      response += `📅 Date: ${signal.date}\n`;
      response += `📈 Win Probability: ${signal.winProb}\n`;
      response += `⚽ Goals: ${signal.goals}\n`;
      response += `🚦 Risk Level: ${signal.risk}\n`;
      response += `-----------------------------\n`;
    });

    ctx.replyWithMarkdown(response);
  } catch (err) {
    ctx.reply("❌ Failed to load signals.");
  }
});

// ✅ /deletesignal
bot.command("deletesignal", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("⛔ Only the admin can delete signals.");

  const indexToDelete = parseInt(ctx.message.text.split(" ")[1]) - 1;
  if (isNaN(indexToDelete)) return ctx.reply("❗ Example: /deletesignal 2");

  try {
    const signals = JSON.parse(fs.readFileSync("data/signals.json"));
    if (indexToDelete < 0 || indexToDelete >= signals.length) return ctx.reply("❗ Invalid signal number.");

    const removed = signals.splice(indexToDelete, 1);
    fs.writeFileSync("data/signals.json", JSON.stringify(signals, null, 2));
    ctx.reply(`✅ Signal "${removed[0].match}" deleted.`);
  } catch {
    ctx.reply("❌ Error deleting signal.");
  }
});

// ✅ /deletesignalbyid
bot.command("deletesignalbyid", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("⛔ Only the admin can delete signals.");

  const idToDelete = ctx.message.text.split(" ")[1];
  if (!idToDelete) return ctx.reply("❗ Example: /deletesignalbyid <id>");

  try {
    let signals = JSON.parse(fs.readFileSync("data/signals.json"));
    const index = signals.findIndex(s => s.id === idToDelete);
    if (index === -1) return ctx.reply("❗ Signal not found.");

    const removed = signals.splice(index, 1);
    fs.writeFileSync("data/signals.json", JSON.stringify(signals, null, 2));
    ctx.reply(`✅ Signal "${removed[0].match}" deleted.`);
  } catch {
    ctx.reply("❌ Error deleting by ID.");
  }
});

// ✅ /pay
bot.command("pay", (ctx) => {
  ctx.reply(
    `💳 *VIP Access - Only $5 USDT Equivalent*\n\nChoose a network and send your payment:\n\n` +
    `🟦 *TON:*\n\`UQDJ3Q6JUzog9PwOEhpZrtx-_QHIrK34T5s6XyiFIx3Pbv6E\`\n\n` +
    `🟣 *Solana (SOL):*\n\`YRCtNMRV477S8KMvnjZ6mGTisiFmhJ9oMQBDYreD2NS\`\n\n` +
    `⚫ *Ethereum (ETH / USDT):*\n\`0x76c877f5A55ADe97741E23ebE3438d86800dD1b5\`\n\n` +
    `👉 After payment, send:\n/txhash <your_transaction_hash>`
  , { parse_mode: "Markdown" });
});

// ✅ /txhash (فعلاً بدون بررسی واقعی)
bot.command("txhash", (ctx) => {
  const txHash = ctx.message.text.split(" ")[1];
  if (!txHash) return ctx.reply("❗ Please send your tx hash.\nExample: /txhash abc123...");
  ctx.reply("⏳ Thanks! We'll verify and grant VIP access soon.");
});

// ✅ /addvip
bot.command("addvip", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("⛔ Admin only.");
  const newUserId = parseInt(ctx.message.text.split(" ")[1]);
  if (isNaN(newUserId)) return ctx.reply("❗ Example: /addvip 123456");

  const vipList = JSON.parse(fs.readFileSync("data/vip.json"));
  if (vipList.includes(newUserId)) return ctx.reply("ℹ️ Already VIP.");

  vipList.push(newUserId);
  fs.writeFileSync("data/vip.json", JSON.stringify(vipList, null, 2));
  ctx.reply(`✅ User ${newUserId} is now VIP.`);
});

// ✅ /removevip
bot.command("removevip", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("⛔ Admin only.");
  const userId = parseInt(ctx.message.text.split(" ")[1]);
  if (isNaN(userId)) return ctx.reply("❗ Example: /removevip 123456");

  let vipList = JSON.parse(fs.readFileSync("data/vip.json"));
  if (!vipList.includes(userId)) return ctx.reply("ℹ️ Not in VIP list.");

  vipList = vipList.filter(id => id !== userId);
  fs.writeFileSync("data/vip.json", JSON.stringify(vipList, null, 2));
  ctx.reply(`✅ User ${userId} removed from VIP.`);
});

// ✅ /gensignal (تولید سیگنال با AI)
bot.command("gensignal", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("⛔ Admin only.");

  try {
    const matches = JSON.parse(fs.readFileSync("data/matches.json"));
    const signals = [];

    matches.forEach(match => {
      const { match: matchName, date, home_strength, away_strength, recent_form } = match;

      const strength_diff = Math.abs(home_strength - away_strength);
      let winProb = "";
      let goals = "";
      let risk = "";

      const [team1, team2] = matchName.split(" vs ");
      winProb = `${team1} ${(home_strength / (home_strength + away_strength) * 100).toFixed(0)}% - ${team2} ${(away_strength / (home_strength + away_strength) * 100).toFixed(0)}%`;

      const form = Object.values(recent_form).join("");
      const attackingForm = (form.match(/W/g) || []).length;
      goals = (attackingForm >= 6) ? "Over 2.5" : "Under 2.5";

      if (strength_diff >= 10) risk = "Low";
      else if (strength_diff >= 5) risk = "Medium";
      else risk = "High";

      signals.push({
        id: uuidv4(),
        match: matchName,
        date,
        winProb,
        goals,
        risk
      });
    });

    fs.writeFileSync("data/signals.json", JSON.stringify(signals, null, 2));
    ctx.reply("✅ AI-generated signals saved successfully!");
  } catch {
    ctx.reply("❌ Failed to generate signals.");
  }
});

// ✅ اجرای خودکار هر روز ساعت 09:00
cron.schedule("0 9 * * *", () => {
  try {
    const matches = JSON.parse(fs.readFileSync("data/matches.json"));
    const signals = [];

    matches.forEach(match => {
      const { match: matchName, date, home_strength, away_strength, recent_form } = match;

      const strength_diff = Math.abs(home_strength - away_strength);
      let winProb = "";
      let goals = "";
      let risk = "";

      const [team1, team2] = matchName.split(" vs ");
      winProb = `${team1} ${(home_strength / (home_strength + away_strength) * 100).toFixed(0)}% - ${team2} ${(away_strength / (home_strength + away_strength) * 100).toFixed(0)}%`;

      const form = Object.values(recent_form).join("");
      const attackingForm = (form.match(/W/g) || []).length;
      goals = (attackingForm >= 6) ? "Over 2.5" : "Under 2.5";

      if (strength_diff >= 10) risk = "Low";
      else if (strength_diff >= 5) risk = "Medium";
      else risk = "High";

      signals.push({
        id: uuidv4(),
        match: matchName,
        date,
        winProb,
        goals,
        risk
      });
    });

    fs.writeFileSync("data/signals.json", JSON.stringify(signals, null, 2));
    console.log("⏰ [Cron] AI-generated signals saved successfully!");
  } catch (err) {
    console.error("❌ [Cron] Error generating signals:", err.message);
  }
});

// ✅ Launch bot
bot.launch();
console.log("✅ FOOTBOT-MASTER is running...");
bot.on("message", (ctx) => {
  return ctx.reply("👇 Tap to open the Mini App:", {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 Open Mini App", web_app: { url: "https://footbot-server.onrender.com" } }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    }
  });
});