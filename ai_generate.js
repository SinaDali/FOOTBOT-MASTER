const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { exec } = require("child_process");

// فایل‌های مسیر
const matchesPath = path.join(__dirname, "data", "matches.json");
const signalsPath = path.join(__dirname, "webapp", "signals.json");

// 📌 Prompt سبک‌شده برای تحلیل سریع
function buildPrompt(match) {
  return `Predict the following for this football match:
Match: ${match.match}
Date: ${match.date}

Respond in JSON format with:
{
  "winProb": "TEAM_A % - TEAM_B %",
  "goals": "Over 2.5" or "Under 2.5",
  "firstHalf": "Yes - At least one goal (confidence: XX%)" or "No - Likely goalless (confidence: XX%)",
  "analysis": "Short 1-2 sentence explanation about team form or history."
}`;
}

// گرفتن پاسخ از Ollama
async function askOllama(prompt) {
  return new Promise((resolve, reject) => {
    const command = `ollama run llama3 "${prompt.replace(/"/g, '\\"')}"`;
    exec(command, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
      if (error) return reject(error);
      try {
        const json = stdout.substring(stdout.indexOf("{"), stdout.lastIndexOf("}") + 1);
        const parsed = JSON.parse(json);
        resolve(parsed);
      } catch (e) {
        reject("❌ Error parsing Ollama response: " + e);
      }
    });
  });
}

// اجرای اصلی
async function main() {
  const matches = JSON.parse(fs.readFileSync(matchesPath, "utf8"));
  const signals = [];

  for (const match of matches) {
    const prompt = buildPrompt(match);
    console.log(`🤖 Analyzing: ${match.match}...`);
    try {
      const ai = await askOllama(prompt);
      signals.push({
        id: uuidv4(),
        match: match.match,
        date: match.date,
        winProb: ai.winProb,
        goals: ai.goals,
        firstHalf: ai.firstHalf,
        risk: "Medium", // فعلاً ریسک ثابته
        analysis: ai.analysis
      });
      console.log(`✅ Done: ${match.match}`);
    } catch (err) {
      console.error(`❌ Failed: ${match.match}`, err);
    }
  }

  fs.writeFileSync(signalsPath, JSON.stringify(signals, null, 2));
  console.log(`\n🚀 Generated ${signals.length} AI signal(s)!`);
}

main();