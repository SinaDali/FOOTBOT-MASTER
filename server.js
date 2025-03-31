const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// سرو فایل‌های Mini App از پوشه webapp
app.use("/", express.static(path.join(__dirname, "webapp")));

// API دریافت سیگنال‌ها
app.get("/signals", (req, res) => {
  try {
    const signals = JSON.parse(fs.readFileSync("data/signals.json"));
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: "Failed to load signals." });
  }
});

// اجرای سرور
app.listen(PORT, () => {
  console.log(`✅ WebApp Server running at http://localhost:${PORT}`);
});