# Test cases (from OpenSpec)

Test cases are derived from:

- `openspec/changes/archive/2026-02-28-game-analytics-dashboard/specs/dashboard-summary/spec.md`
- `openspec/changes/archive/2026-02-28-game-analytics-dashboard/specs/realtime-events/spec.md`

## Backend — API tests

**File:** `backend/test/api.analytics.test.js`  
**Run:** `npm run test:backend` or `cd backend && npm test`

| # | Spec requirement / scenario | Test description |
|---|-----------------------------|------------------|
| 1 | GET /api/analytics with params | Returns 200 and body has items, totalCount, totalPages, page, limit, summary |
| 2 | Default sort newest first | GET without sort params returns items ordered by updatedAt desc |
| 3 | Search filter | GET ?search=test-1 returns entries matching id/totalPlayers/activePlayers |
| 4 | Status filter | GET ?status=active returns only entries with byStatus.active > 0 |
| 5 | Summary reflects current data | After POST, GET /api/analytics returns updated totalCount and summary |
| 6 | GET /api/analytics/summary | Returns 200 and aggregated stats (totalPlayers, activePlayers, avgPlaytimeMinutes, avgScore, byStatus, registrationsByDay) |
| 7 | POST valid body | Persists entry, returns 201 and created object with id, timestamps |
| 8 | POST missing totalPlayers | Returns 400 with error |
| 9 | POST missing activePlayers | Returns 400 with error |
| 10 | POST omit byStatus | Persists with byStatus default { active: 1, inactive: 0, banned: 0 } |
| 11 | POST byStatus all zeros | Persists with byStatus default Active |
| 12 | Realtime: Socket.IO on POST | Server has io; POST success does not throw (emit is used in implementation) |

## Frontend — Create entry form validation

**File:** `frontend/src/components/dashboard/CreateEntryModal.test.jsx`  
**Run:** `npm run test:frontend` or `cd frontend && npm test`

| # | Spec requirement / scenario | Test description |
|---|-----------------------------|------------------|
| 1 | activePlayers ≤ totalPlayers | Schema accepts activePlayers === totalPlayers |
| 2 | activePlayers ≤ totalPlayers | Schema accepts activePlayers < totalPlayers |
| 3 | Submit with activePlayers > totalPlayers | Schema rejects and error message includes "less than or equal to total players", path activePlayers |

## Run all tests

From repo root:

```bash
npm test
```

This runs `test:backend` then `test:frontend`.
