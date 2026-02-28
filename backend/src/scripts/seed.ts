/**
 * Seed script: generate default analytics entries and write to store.
 */

import * as path from 'path';
import * as fs from 'fs';
import { writeAnalytics } from '../services/store.service';
import type { AnalyticsEntry, ByStatus } from '../types';

const DATA_DIR = process.env.ANALYTICS_DATA_DIR || path.join(__dirname, '..', '..', 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function byStatusFor(statusKind: 'active' | 'inactive' | 'banned'): ByStatus {
  const base: ByStatus = { active: 0, inactive: 0, banned: 0 };
  const count = randomInt(1, 500);
  if (statusKind === 'active') base.active = count;
  else if (statusKind === 'inactive') base.inactive = count;
  else if (statusKind === 'banned') base.banned = Math.min(count, 100);
  return base;
}

function generateEntries(count: number = 30): AnalyticsEntry[] {
  const entries: AnalyticsEntry[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);
  const statuses: ('active' | 'inactive' | 'banned')[] = ['active', 'inactive', 'banned'];

  for (let i = 0; i < count; i++) {
    const totalPlayers = randomInt(50, 5000);
    const activePlayers = randomInt(10, totalPlayers);
    const statusKind = statuses[i % statuses.length];
    const byStatus = byStatusFor(statusKind);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + Math.floor((i * 30) / count));
    const iso = date.toISOString();

    entries.push({
      id: `a-seed-${i + 1}-${Date.now()}`,
      createdAt: iso,
      updatedAt: iso,
      totalPlayers,
      activePlayers,
      avgPlaytimeMinutes: Math.round(randomInt(30, 180) * 100) / 100,
      avgScore: Math.round(randomInt(100, 9999) * 100) / 100,
      byStatus,
      registrationsByDay: [],
    });
  }

  return entries;
}

function seed(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const entries = generateEntries(30);
  writeAnalytics(entries);
  console.log(`Seeded ${entries.length} analytics entries to ${ANALYTICS_FILE}`);
}

seed();
