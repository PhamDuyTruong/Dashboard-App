# Game Analytics Mini Dashboard

Mini dashboard for game analytics: summary statistics, table with search/filter/pagination, charts, and create-entry modal. Real-time updates via Socket.IO.

## Prerequisites

- **Node.js** 18.x or 20.x (LTS recommended). Check: `node -v`
- **npm** (comes with Node). Check: `npm -v`

## Repository structure

```
your-repo/
├── backend/     # Express API (JSON file store, Socket.IO)
├── frontend/    # React app (Vite, MUI, TanStack Query, Chart.js)
├── docs/        # Test cases and other docs
└── README.md    # This file
```

## How to run

### 1. Seed data (first time only)

From the repo root, seed the backend with sample analytics entries:

```bash
npm run seed
```

This writes to `backend/data/analytics.json`. Skip if you already have data.

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at **http://localhost:3001**. API and Socket.IO are available at that port.

### 3. Frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**. Open this URL in your browser; Vite proxies `/api` and `/socket.io` to the backend.

You should see the dashboard working (summary cards, charts, table, create-entry modal).

---

**Optional — run both from root:** From repo root, `npm run dev` starts backend and frontend together (requires `npm install` at root first).

## API endpoints

Base URL when running locally: `http://localhost:3001/api` (or use the frontend at :5173; it proxies to the backend).

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/analytics` | Paginated list of analytics entries plus aggregated summary. |
| **GET** | `/api/analytics/summary` | Aggregated stats only (no list). |
| **POST** | `/api/analytics` | Create a new analytics entry. |

### GET `/api/analytics`

Returns paginated items and a summary object.

**Query parameters:**

| Query   | Type   | Description |
|---------|--------|-------------|
| `page`  | number | Page number (default: 1). |
| `limit` | number | Items per page (default: 10, max: 100). |
| `search`| string | Free-text search on id, totalPlayers, activePlayers. |
| `status`| string | Filter by status: `active`, `inactive`, or `banned`. |
| `dateFrom` | string | Filter entries from this date (YYYY-MM-DD). |
| `dateTo`   | string | Filter entries until this date (YYYY-MM-DD). |
| `sortBy`   | string | Sort field: `createdAt` or `updatedAt` (default: `updatedAt`). |
| `sortOrder`| string | `asc` or `desc` (default: `desc`). |

**Response (200):**

```json
{
  "items": [...],
  "totalCount": 30,
  "totalPages": 3,
  "page": 1,
  "limit": 10,
  "summary": {
    "totalPlayers": 12345,
    "activePlayers": 5000,
    "avgPlaytimeMinutes": 85.5,
    "avgScore": 1200,
    "byStatus": { "active": 5000, "inactive": 6000, "banned": 1345 },
    "registrationsByDay": []
  }
}
```

### GET `/api/analytics/summary`

Returns aggregated statistics only.

**Response (200):** Same shape as the `summary` object above.

### POST `/api/analytics`

Creates a new analytics entry. On success, the server emits `dashboard:refresh` via Socket.IO so connected clients can refetch.

**Request body (JSON):**

| Field              | Type   | Required | Description |
|--------------------|--------|----------|-------------|
| `totalPlayers`     | number | Yes      | Non-negative. |
| `activePlayers`    | number | Yes      | Non-negative; should be ≤ totalPlayers. |
| `avgPlaytimeMinutes` | number | No     | Non-negative (default: 0). |
| `avgScore`         | number | No       | Non-negative (default: 0). |
| `byStatus`         | object | No       | `{ active, inactive, banned }`. If omitted or all zeros, defaults to Active. |
| `registrationsByDay` | array | No      | Array of `{ date, count }` (default: []). |

**Response (201):** The created entry (includes `id`, `createdAt`, `updatedAt`).

**Response (400):** Validation failed (e.g. missing required fields, invalid types). Body: `{ "error": "Validation failed", "details": [...] }`.

## Other scripts (from repo root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Run backend and frontend concurrently (root) |
| `npm run backend` | Run backend only (`cd backend && node index.js`) |
| `npm run frontend` | Run frontend only (`cd frontend && npm run dev`) |
| `npm run seed` | Seed `backend/data/analytics.json` |
| `npm test` | Run backend + frontend tests |
| `npm run test:backend` | Run backend API tests |
| `npm run test:frontend` | Run frontend unit tests |

## Testing

- **Backend:** `backend/test/api.analytics.test.js` (Node `node:test` + supertest).
- **Frontend:** `frontend/src/components/dashboard/CreateEntryModal.test.jsx` (Vitest).

See `docs/TEST_CASES.md` for the full list of test cases.
