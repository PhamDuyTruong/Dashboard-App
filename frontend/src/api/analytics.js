import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${baseURL}/api` });

export function getAnalytics(params = {}) {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.limit != null) query.set('limit', String(params.limit));
  if (params.search != null && params.search !== '') query.set('search', String(params.search));
  if (params.status != null && params.status !== '') query.set('status', String(params.status));
  query.set('sortBy', String(params.sortBy ?? 'updatedAt'));
  query.set('sortOrder', String(params.sortOrder ?? 'desc'));
  return api.get(`/analytics?${query.toString()}`).then((r) => r.data);
}

export function getAnalyticsSummary() {
  return api.get('/analytics/summary').then((r) => r.data);
}

export function postAnalyticsEntry(body) {
  return api.post('/analytics', body).then((r) => r.data);
}
