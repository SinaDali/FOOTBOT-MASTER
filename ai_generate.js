const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const matchesPath = "./data/matches.json";
const signalsPath = "./data/signals.json";

function randomPercent(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSignal(match) {
  const [home, away] = match.match.split(" vs ");
  const homeWin = randomPercent(45, 55);
  const awayWin = 100 - homeWin;

  const riskLevels = ["Low", "Medium", "High"];
  const goalsOptions = ["Over 2.5", "Under 2.5", "BTTS", "Clean Sheet"];

  const firstHalf = {
    chance: randomPercent(60, 90),
    text: randomPercent(0, 1)
      ? `Yes - At least one goal (confidence: ${randomPercent(70, 95)}%)`
      : `No - Likely goalless (confidence: ${randomPercent(60, 80)}%)`
  };

  const analysis = `In their last 5 meetings, ${home} won ${randomPercent(1, 3)}, ${away} won ${randomPercent(1, 3)}, and ${randomPercent(0, 2)} were draws. ${match.motivation || home + " is fighting for 3 points."}`;

  return {
    id: uuidv4(),
    match: match.match,
    date: match.date,
    winProb: `${home} ${homeWin}% - ${away} ${awayWin}%`,
    goals: goalsOptions[Math.floor(Math.random() * goalsOptions.length)],
    firstHalf: firstHalf.text,
    risk: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    analysis
  };
}

function main() {
  try {
    const matches = JSON.parse(fs.readFileSync(matchesPath));
    let existingSignals = [];
    if (fs.existsSync(signalsPath)) {
      existingSignals = JSON.parse(fs.readFileSync(signalsPath));
    }

    const newSignals = matches.map((match) => generateSignal(match));
    const updatedSignals = [...existingSignals, ...newSignals];

    fs.writeFileSync(signalsPath, JSON.stringify(updatedSignals, null, 2));
    console.log(`✅ Generated ${newSignals.length} new signal(s)!`);
  } catch (err) {
    console.error("❌ Error generating signals:", err);
  }
}

main();