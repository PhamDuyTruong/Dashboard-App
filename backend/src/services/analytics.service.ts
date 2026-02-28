/**
 * Analytics service: filter, sort, paginate entries.
 * Reusable business logic; no HTTP or I/O.
 */

import type { AnalyticsEntry, ListQuery } from '../types';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, SORT_FIELDS, SORT_ORDERS, isStatusValue } from '../config/constants';

export function filterEntries(entries: AnalyticsEntry[], query: ListQuery): AnalyticsEntry[] {
  let result = [...entries];

  const q = (query.search ?? '').trim().toLowerCase();
  if (q) {
    result = result.filter((e) => {
      const str = [
        String(e.id ?? ''),
        String(e.totalPlayers ?? ''),
        String(e.activePlayers ?? ''),
      ]
        .join(' ')
        .toLowerCase();
      return str.includes(q);
    });
  }

  const status = (query.status ?? '').toLowerCase();
  if (status && isStatusValue(status)) {
    result = result.filter((e) => {
      const s = e.byStatus?.[status as keyof typeof e.byStatus];
      return s != null && Number(s) > 0;
    });
  }

  const dateFrom = query.dateFrom;
  if (dateFrom) {
    result = result.filter((e) => e.createdAt && e.createdAt.slice(0, 10) >= dateFrom);
  }

  const dateTo = query.dateTo;
  if (dateTo) {
    result = result.filter((e) => e.createdAt && e.createdAt.slice(0, 10) <= dateTo);
  }

  return result;
}

export function parsePagination(query: ListQuery): { page: number; limit: number } {
  const page = Math.max(1, parseInt(String(query.page), 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(query.limit), 10) || DEFAULT_LIMIT));
  return { page, limit };
}

export function sortEntries(
  entries: AnalyticsEntry[],
  sortBy: string,
  sortOrder: string
): AnalyticsEntry[] {
  const field = SORT_FIELDS.has(sortBy) ? sortBy : 'updatedAt';
  const order = SORT_ORDERS.has(sortOrder) ? sortOrder : 'desc';
  const dir = order === 'asc' ? 1 : -1;

  const getVal = (e: AnalyticsEntry): string =>
    field === 'createdAt' ? (e.createdAt ?? '') : (e.updatedAt ?? e.createdAt ?? '');

  return [...entries].sort((a, b) => {
    return dir * getVal(a).localeCompare(getVal(b), undefined, { numeric: true });
  });
}

export function getSortParams(query: ListQuery): { sortBy: string; sortOrder: string } {
  const sortBy = (query.sortBy && String(query.sortBy)) || 'updatedAt';
  const sortOrder = (query.sortOrder && String(query.sortOrder).toLowerCase()) || 'desc';
  return { sortBy, sortOrder };
}
