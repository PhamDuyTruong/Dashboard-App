const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.ANALYTICS_DATA_DIR || path.join(__dirname, '..', 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAnalytics() {
  ensureDataDir();
  if (!fs.existsSync(ANALYTICS_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(ANALYTICS_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAnalytics(entries) {
  ensureDataDir();
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

module.exports = { readAnalytics, writeAnalytics };
