/**
 * Test cases from OpenSpec: Create entry form — validation
 * Spec: activePlayers must be ≤ totalPlayers; show error and do not submit when violated.
 */
import { describe, it, expect } from 'vitest';
import { createEntrySchema } from './CreateEntryModal';

describe('Create entry schema (OpenSpec: activePlayers ≤ totalPlayers)', () => {
  it('valid when activePlayers <= totalPlayers', () => {
    const result = createEntrySchema.safeParse({
      totalPlayers: 10,
      activePlayers: 10,
      avgPlaytimeMinutes: 0,
      avgScore: 0,
    });
    expect(result.success).toBe(true);
  });

  it('valid when activePlayers < totalPlayers', () => {
    const result = createEntrySchema.safeParse({
      totalPlayers: 10,
      activePlayers: 5,
      avgPlaytimeMinutes: 0,
      avgScore: 0,
    });
    expect(result.success).toBe(true);
  });

  it('invalid when activePlayers > totalPlayers — shows required error message', () => {
    const result = createEntrySchema.safeParse({
      totalPlayers: 10,
      activePlayers: 15,
      avgPlaytimeMinutes: 0,
      avgScore: 0,
    });
    expect(result.success).toBe(false);
    const error = result.error;
    expect(error.issues.some((i) => i.message.includes('less than or equal to total players'))).toBe(true);
    expect(error.issues.some((i) => i.path && i.path.includes('activePlayers'))).toBe(true);
  });
});
