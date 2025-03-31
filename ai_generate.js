const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// دریافت لیست بازی‌ها
const matches = JSON.parse(fs.readFileSync("data/matches.json"));

// لیست خروجی سیگنال‌ها
const signals = [];

matches.forEach(match => {
  const { match: matchName, league, date, time, home_strength, away_strength, recent_form } = match;

  const strength_diff = Math.abs(home_strength - away_strength);
  let winProb = "";
  let goals = "";
  let risk = "";

  // تحلیل احتمال برد
  if (home_strength > away_strength) {
    winProb = `${matchName.split(" vs ")[0]} ${(home_strength / (home_strength + away_strength) * 100).toFixed(0)}% - ${matchName.split(" vs ")[1]} ${(away_strength / (home_strength + away_strength) * 100).toFixed(0)}%`;
  } else {
    winProb = `${matchName.split(" vs ")[0]} ${(home_strength / (home_strength + away_strength) * 100).toFixed(0)}% - ${matchName.split(" vs ")[1]} ${(away_strength / (home_strength + away_strength) * 100).toFixed(0)}%`;
  }

  // تحلیل گل‌ها
  const form = Object.values(recent_form).join("");
  const attackingForm = (form.match(/W/g) || []).length;

  if (attackingForm >= 6) {
    goals = "Over 2.5";
  } else {
    goals = "Under 2.5";
  }

  // تحلیل ریسک
  if (strength_diff >= 10) {
    risk = "Low";
  } else if (strength_diff >= 5) {
    risk = "Medium";
  } else {
    risk = "High";
  }

  // ساخت سیگنال نهایی
  const signal = {
    id: uuidv4(),
    match: matchName,
    date: date,
    winProb: winProb,
    goals: goals,
    risk: risk
  };

  signals.push(signal);
});

fs.writeFileSync("data/signals.json", JSON.stringify(signals, null, 2));

console.log("✅ AI-generated signals saved to data/signals.json");