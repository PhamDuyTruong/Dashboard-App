/**
 * Store service: read/write analytics data (JSON file).
 * Single responsibility: persistence only.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AnalyticsEntry } from '../types';

const DATA_DIR = process.env.ANALYTICS_DATA_DIR || path.join(__dirname, '..', '..', 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readAnalytics(): AnalyticsEntry[] {
  ensureDataDir();
  if (!fs.existsSync(ANALYTICS_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(ANALYTICS_FILE, 'utf8');
  try {
    return JSON.parse(raw) as AnalyticsEntry[];
  } catch {
    return [];
  }
}

export function writeAnalytics(entries: AnalyticsEntry[]): void {
  ensureDataDir();
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(entries, null, 2), 'utf8');
}
