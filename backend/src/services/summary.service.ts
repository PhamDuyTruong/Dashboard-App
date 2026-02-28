/**
 * Summary service: aggregate analytics entries into summary stats.
 * Pure business logic, no I/O.
 */

import type { AnalyticsEntry, Summary, ByStatus, RegistrationDay } from '../types';

const DEFAULT_SUMMARY: Summary = {
  totalPlayers: 0,
  activePlayers: 0,
  avgPlaytimeMinutes: 0,
  avgScore: 0,
  byStatus: { active: 0, inactive: 0, banned: 0 },
  registrationsByDay: [],
};

export function computeSummary(entries: AnalyticsEntry[]): Summary {
  if (!entries?.length) {
    return { ...DEFAULT_SUMMARY };
  }

  const totalPlayers = entries.reduce((sum, e) => sum + (Number(e.totalPlayers) || 0), 0);
  const activePlayers = entries.reduce((sum, e) => sum + (Number(e.activePlayers) || 0), 0);
  const sumPlaytime = entries.reduce(
    (sum, e) => sum + (Number(e.avgPlaytimeMinutes) || 0) * (e.totalPlayers || 0),
    0
  );
  const sumScore = entries.reduce(
    (sum, e) => sum + (Number(e.avgScore) || 0) * (e.totalPlayers || 0),
    0
  );

  const byStatus: ByStatus = { active: 0, inactive: 0, banned: 0 };
  const dayMap = new Map<string, number>();

  for (const e of entries) {
    if (e.byStatus) {
      if (e.byStatus.active != null) byStatus.active += Number(e.byStatus.active) || 0;
      if (e.byStatus.inactive != null) byStatus.inactive += Number(e.byStatus.inactive) || 0;
      if (e.byStatus.banned != null) byStatus.banned += Number(e.byStatus.banned) || 0;
    }
    const day = e.createdAt ? e.createdAt.slice(0, 10) : null;
    if (day) dayMap.set(day, (dayMap.get(day) || 0) + 1);
  }

  const registrationsByDay: RegistrationDay[] = [...dayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const avgPlaytimeMinutes = totalPlayers > 0 ? sumPlaytime / totalPlayers : 0;
  const avgScore = totalPlayers > 0 ? sumScore / totalPlayers : 0;

  return {
    totalPlayers,
    activePlayers,
    avgPlaytimeMinutes: Math.round(avgPlaytimeMinutes * 100) / 100,
    avgScore: Math.round(avgScore * 100) / 100,
    byStatus,
    registrationsByDay,
  };
}
