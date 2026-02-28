/**
 * Shared types for the analytics backend (MVC models layer).
 */

export interface ByStatus {
  active: number;
  inactive: number;
  banned: number;
}

export interface RegistrationDay {
  date: string;
  count: number;
}

export interface AnalyticsEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalPlayers: number;
  activePlayers: number;
  avgPlaytimeMinutes: number;
  avgScore: number;
  byStatus: ByStatus;
  registrationsByDay: RegistrationDay[];
}

export interface Summary {
  totalPlayers: number;
  activePlayers: number;
  avgPlaytimeMinutes: number;
  avgScore: number;
  byStatus: ByStatus;
  registrationsByDay: RegistrationDay[];
}

export interface ListQuery {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginationResult {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface AnalyticsListResponse extends PaginationResult {
  items: AnalyticsEntry[];
  summary: Summary;
}

export interface CreateEntryBody {
  totalPlayers: number;
  activePlayers?: number;
  avgPlaytimeMinutes?: number;
  avgScore?: number;
  byStatus?: Partial<ByStatus>;
  registrationsByDay?: RegistrationDay[];
}
