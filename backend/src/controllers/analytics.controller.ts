/**
 * Analytics controller: HTTP request/response handling.
 * Delegates business logic to services; no direct I/O here.
 */

import type { Request, Response } from 'express';
import type { Server as SocketIOServer } from 'socket.io';
import type { AnalyticsEntry, ListQuery } from '../types';
import { readAnalytics, writeAnalytics } from '../services/store.service';
import { computeSummary } from '../services/summary.service';
import {
  filterEntries,
  sortEntries,
  parsePagination,
  getSortParams,
} from '../services/analytics.service';
import { validateCreateEntryBody, normalizeCreateBody } from '../validators/analytics.validator';

function queryToListQuery(req: Request): ListQuery {
  const q = req.query as Record<string, string | undefined>;
  const search = (q.q ?? q.search ?? '').trim();
  return {
    search: search || undefined,
    status: q.status?.toLowerCase() || undefined,
    dateFrom: q.dateFrom,
    dateTo: q.dateTo,
    page: q.page != null ? parseInt(q.page, 10) : undefined,
    limit: q.limit != null ? parseInt(q.limit, 10) : undefined,
    sortBy: q.sortBy,
    sortOrder: q.sortOrder?.toLowerCase(),
  };
}

export function getList(_req: Request, res: Response): void {
  try {
    const entries = readAnalytics();
    const query = queryToListQuery(_req);
    const filtered = filterEntries(entries, query);
    const { sortBy, sortOrder } = getSortParams(query);
    const sorted = sortEntries(filtered, sortBy, sortOrder);
    const summary = computeSummary(entries);
    const { page, limit } = parsePagination(query);
    const totalCount = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const start = (page - 1) * limit;
    const items = sorted.slice(start, start + limit);

    res.json({
      items,
      totalCount,
      totalPages,
      page,
      limit,
      summary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read analytics' });
  }
}

export function getSummary(_req: Request, res: Response): void {
  try {
    const entries = readAnalytics();
    const summary = computeSummary(entries);
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read summary' });
  }
}

export function createEntry(io: SocketIOServer | null) {
  return (req: Request, res: Response): void => {
    try {
      const body = req.body ?? {};
      const validation = validateCreateEntryBody(body);
      if (!validation.valid) {
        res.status(400).json({ error: 'Validation failed', details: validation.errors });
        return;
      }

      const entries = readAnalytics();
      const normalized = normalizeCreateBody(body as Record<string, unknown>);
      const id = `a-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const createdAt = new Date().toISOString();

      const entry: AnalyticsEntry = {
        id,
        createdAt,
        updatedAt: createdAt,
        totalPlayers: normalized.totalPlayers,
        activePlayers: normalized.activePlayers ?? 0,
        avgPlaytimeMinutes: normalized.avgPlaytimeMinutes ?? 0,
        avgScore: normalized.avgScore ?? 0,
        byStatus: normalized.byStatus,
        registrationsByDay: normalized.registrationsByDay ?? [],
      };

      entries.push(entry);
      writeAnalytics(entries);

      if (io) io.emit('dashboard:refresh');
      res.status(201).json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create analytics entry' });
    }
  };
}
