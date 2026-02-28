/**
 * Request validation for analytics endpoints.
 * Keeps controllers thin and validation reusable.
 */

import type { ByStatus, CreateEntryBody } from '../types';

/** Normalized body with required byStatus (defaults applied). */
export interface NormalizedCreateBody extends Omit<CreateEntryBody, 'byStatus'> {
  byStatus: ByStatus;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const nonNegativeNumber = (v: unknown): v is number =>
  typeof v === 'number' && !Number.isNaN(v) && v >= 0;

export function validateCreateEntryBody(body: unknown): ValidationResult {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;

  if (b.totalPlayers == null) {
    errors.push('totalPlayers is required');
  } else if (!nonNegativeNumber(b.totalPlayers)) {
    errors.push('totalPlayers must be a non-negative number');
  }

  if (b.activePlayers == null) {
    errors.push('activePlayers is required');
  } else if (!nonNegativeNumber(b.activePlayers)) {
    errors.push('activePlayers must be a non-negative number');
  }
  if (b.avgPlaytimeMinutes != null && !nonNegativeNumber(b.avgPlaytimeMinutes)) {
    errors.push('avgPlaytimeMinutes must be a non-negative number');
  }
  if (b.avgScore != null && !nonNegativeNumber(b.avgScore)) {
    errors.push('avgScore must be a non-negative number');
  }
  if (b.byStatus != null && (typeof b.byStatus !== 'object' || Array.isArray(b.byStatus))) {
    errors.push('byStatus must be an object');
  }
  if (b.registrationsByDay != null && !Array.isArray(b.registrationsByDay)) {
    errors.push('registrationsByDay must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function normalizeCreateBody(body: Record<string, unknown>): NormalizedCreateBody {
  const byStatus = body.byStatus as Partial<ByStatus> | undefined;
  const hasStatus =
    byStatus &&
    ((Number(byStatus.active) || 0) > 0 ||
      (Number(byStatus.inactive) || 0) > 0 ||
      (Number(byStatus.banned) || 0) > 0);

  return {
    totalPlayers: Number(body.totalPlayers),
    activePlayers: body.activePlayers != null ? Number(body.activePlayers) : 0,
    avgPlaytimeMinutes: body.avgPlaytimeMinutes != null ? Number(body.avgPlaytimeMinutes) : 0,
    avgScore: body.avgScore != null ? Number(body.avgScore) : 0,
    byStatus: hasStatus
      ? {
          active: Number(byStatus?.active) || 0,
          inactive: Number(byStatus?.inactive) || 0,
          banned: Number(byStatus?.banned) || 0,
        }
      : { active: 1, inactive: 0, banned: 0 },
    registrationsByDay: (Array.isArray(body.registrationsByDay)
      ? body.registrationsByDay
      : []) as CreateEntryBody['registrationsByDay'],
  };
}
