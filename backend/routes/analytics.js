const express = require('express');
const { readAnalytics, writeAnalytics } = require('../utils/store');
const { computeSummary } = require('../utils/summary');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function filterEntries(entries, query) {
  let result = [...entries];
  const q = (query.q || query.search || '').trim().toLowerCase();
  if (q) {
    result = result.filter((e) => {
      const str = [
        String(e.id || ''),
        String(e.totalPlayers ?? ''),
        String(e.activePlayers ?? ''),
      ].join(' ').toLowerCase();
      return str.includes(q);
    });
  }
  const status = (query.status || '').toLowerCase();
  if (status && (status === 'active' || status === 'inactive' || status === 'banned')) {
    result = result.filter((e) => {
      const s = e.byStatus && e.byStatus[status];
      return s != null && Number(s) > 0;
    });
  }
  const dateFrom = query.dateFrom;
  const dateTo = query.dateTo;
  if (dateFrom) {
    result = result.filter((e) => e.createdAt && e.createdAt.slice(0, 10) >= dateFrom);
  }
  if (dateTo) {
    result = result.filter((e) => e.createdAt && e.createdAt.slice(0, 10) <= dateTo);
  }
  return result;
}

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  return { page, limit };
}

const SORT_FIELDS = new Set(['createdAt', 'updatedAt']);
const SORT_ORDERS = new Set(['asc', 'desc']);

function sortEntries(entries, sortBy, sortOrder) {
  const field = SORT_FIELDS.has(sortBy) ? sortBy : 'updatedAt';
  const order = SORT_ORDERS.has(sortOrder) ? sortOrder : 'desc';
  const dir = order === 'asc' ? 1 : -1;
  return entries.toSorted((a, b) => {
    // Use updatedAt || createdAt so entries without updatedAt (legacy) still sort by created time
    const va = a[field] || a.createdAt || '';
    const vb = b[field] || b.createdAt || '';
    return dir * (String(va).localeCompare(String(vb), undefined, { numeric: true }));
  });
}

module.exports = function analyticsRoutes(io) {
  const router = express.Router();

  router.get('/analytics', (req, res) => {
    try {
      const entries = readAnalytics();
      const filtered = filterEntries(entries, req.query);
      // Default: newest first (so new entries appear at top of list)
      const sortBy = (req.query.sortBy && String(req.query.sortBy)) || 'updatedAt';
      const sortOrder = (req.query.sortOrder && String(req.query.sortOrder).toLowerCase()) || 'desc';
      const sorted = sortEntries(filtered, sortBy, sortOrder);
      const summary = computeSummary(entries);
      const { page, limit } = parsePagination(req.query);
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
  });

  router.get('/analytics/summary', (req, res) => {
    try {
      const entries = readAnalytics();
      const summary = computeSummary(entries);
      res.json(summary);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read summary' });
    }
  });

  const postSchema = {
    totalPlayers: (v) => typeof v === 'number' && v >= 0,
    activePlayers: (v) => typeof v === 'number' && v >= 0,
    avgPlaytimeMinutes: (v) => typeof v === 'number' && v >= 0,
    avgScore: (v) => typeof v === 'number' && v >= 0,
    byStatus: (v) => !v || (typeof v === 'object' && !Array.isArray(v)),
    registrationsByDay: (v) => !v || Array.isArray(v),
  };

  router.post('/analytics', (req, res) => {
    try {
      const body = req.body || {};
      const errors = [];
      if (body.totalPlayers == null) errors.push('totalPlayers is required');
      else if (!postSchema.totalPlayers(body.totalPlayers)) errors.push('totalPlayers must be a non-negative number');
      if (body.activePlayers == null) errors.push('activePlayers is required');
      else if (!postSchema.activePlayers(body.activePlayers)) errors.push('activePlayers must be a non-negative number');
      if (body.avgPlaytimeMinutes != null && !postSchema.avgPlaytimeMinutes(body.avgPlaytimeMinutes)) errors.push('avgPlaytimeMinutes must be a non-negative number');
      if (body.avgScore != null && !postSchema.avgScore(body.avgScore)) errors.push('avgScore must be a non-negative number');
      if (body.byStatus != null && !postSchema.byStatus(body.byStatus)) errors.push('byStatus must be an object');
      if (body.registrationsByDay != null && !postSchema.registrationsByDay(body.registrationsByDay)) errors.push('registrationsByDay must be an array');
      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      const entries = readAnalytics();
      const id = `a-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const createdAt = new Date().toISOString();
      const entry = {
        id,
        createdAt,
        updatedAt: createdAt,
        totalPlayers: body.totalPlayers,
        activePlayers: body.activePlayers ?? 0,
        avgPlaytimeMinutes: body.avgPlaytimeMinutes ?? 0,
        avgScore: body.avgScore ?? 0,
        byStatus: body.byStatus && (body.byStatus.active > 0 || body.byStatus.inactive > 0 || body.byStatus.banned > 0)
          ? body.byStatus
          : { active: 1, inactive: 0, banned: 0 },
        registrationsByDay: body.registrationsByDay || [],
      };
      entries.push(entry);
      writeAnalytics(entries);
      if (io) io.emit('dashboard:refresh');
      res.status(201).json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create analytics entry' });
    }
  });

  return router;
};
