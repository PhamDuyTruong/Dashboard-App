/**
 * Backend constants (pagination, sort, validation).
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const SORT_FIELDS = new Set<string>(['createdAt', 'updatedAt']);
export const SORT_ORDERS = new Set<string>(['asc', 'desc']);

export const STATUS_VALUES = ['active', 'inactive', 'banned'] as const;
export type StatusValue = (typeof STATUS_VALUES)[number];

export function isStatusValue(s: string): s is StatusValue {
  return STATUS_VALUES.includes(s as StatusValue);
}
