# Design: Game Analytics Mini Dashboard

## Context

- Greenfield project: no existing codebase. Stack chosen: React (Vite) + Express.js, JSON file store, Tailwind CSS + MUI for layout, TanStack Table + TanStack Query for table and server state, Chart.js for charts, Redux for UI state (e.g. dark mode), react-hook-form + zod for forms, Socket.IO for real-time.
- Target: mini dashboard for game analytics showing summary statistics (total, average, etc.) and an analytics table with search/filter; create new analytics entry via modal. Real-time refresh via WebSocket or polling. No player CRUD.
- Constraints: JSON file(s) for persistence (no external DB), prototype-friendly; live data via Socket.IO or polling.

## Goals / Non-Goals

**Goals:**

- Deliver a single Dashboard page: summary StatCards, analytics table (TanStack Table with filtering/search), bar and line charts (Chart.js), activity feed.
- Expose analytics API: `GET /api/analytics` (with search and filtering), `GET /api/analytics/summary`, `POST /api/analytics`; persist in JSON file(s). Backend validation and error handling.
- Live data refresh: WebSocket (Socket.IO) or polling so clients see updates without full reload.
- Create new entry modal: react-hook-form + zod for validation; submit via `POST /api/analytics`.
- Use MUI + Tailwind for layout and theme; TanStack Query to fetch and render list/data; Redux for dark mode toggle state.

**Non-Goals:**

- Player CRUD (no Players page, no `/api/players` endpoints).
- Production-scale persistence, auth, or multi-tenant support.
- Full game analytics pipeline (ingestion, ETL); only read/aggregate from the store.
- Mobile app or PWA; desktop-first responsive web only.

## Decisions

### 1. Monorepo layout: `server/` and `client/` at repo root

- **Choice**: Two top-level folders; root `package.json` runs both via `concurrently` (e.g. `dev` script).
- **Rationale**: Clear separation; single repo avoids CORS and deployment complexity for a small app.
- **Alternative**: Single Next.js app with API routes — rejected to match explicit React + Express choice and keep backend simple (plain Express + fs).

### 2. Data store: JSON file(s) with fs read/write

- **Choice**: `server/data/` holds one or more JSON files (e.g. `analytics.json` for entries, and optionally `players.json` for read-only seed used to compute summary). Read with `fs.readFileSync`, write with `fs.writeFileSync` after in-memory update.
- **Rationale**: No DB setup, good for prototype and local dev; aligns with “JSON Server / local JSON” preference.
- **Alternative**: SQLite/Prisma — more structure but adds dependency and setup; deferred.

### 3. Real-time: Socket.IO (server + client)

- **Choice**: Socket.IO attached to the same Express server; server emits `dashboard:refresh` when analytics data changes (e.g. after `POST /api/analytics`).
- **Rationale**: WebSocket with fallback; simple broadcast model; frontend refetches summary on event.
- **Alternative**: Polling — simpler but more traffic and delay; chosen Socket.IO for “live” feel.

### 4. Frontend state on real-time events

- **Choice**: Live data refresh via WebSocket (Socket.IO) or polling. Client uses a `useSocket` (or similar) hook when using Socket.IO; on `dashboard:refresh`, invalidate/refetch TanStack Query so list and summary update. Alternatively, polling at an interval for `GET /api/analytics` or `GET /api/analytics/summary`.
- **Rationale**: Keeps API as source of truth; TanStack Query handles cache and refetch.
- **Alternative**: Server sends full payload in event — refetch is preferred for consistency with REST and simpler client state.

### 5. API shape

- **GET /api/analytics**: Returns paginated list plus summary. Query params: `search` (free-text), `status` (active|inactive|banned), `dateFrom`/`dateTo`, `page`, `limit`, `sortBy` (createdAt|updatedAt), `sortOrder` (asc|desc). Default sort: `updatedAt` desc (newest first). Response: `{ items, totalCount, totalPages, page, limit, summary }` where `summary` has `totalPlayers`, `activePlayers`, `avgPlaytimeMinutes`, `avgScore`, `byStatus`, `registrationsByDay`. Implement basic validation and error handling (400 for bad params, 500 with message for server errors).
- **GET /api/analytics/summary**: Returns aggregated stats only (same shape as summary portion of `GET /api/analytics`). No search/filter required.
- **POST /api/analytics**: Create new analytics entry. Body: e.g. `{ totalPlayers, activePlayers, avgPlaytimeMinutes, avgScore, byStatus, registrationsByDay }`. Validate body (required fields, types); on failure return 400 with error message. On success persist (new entries get `updatedAt` set; if `byStatus` missing or all zeros, default to `{ active: 1, inactive: 0, banned: 0 }` so new entries show as Active) and emit `dashboard:refresh`.

### 6. Data and seed

- **Analytics entries**: Stored in JSON (e.g. `analytics.json`). Each entry includes totalPlayers, activePlayers, avgPlaytimeMinutes, avgScore, byStatus (`{ active, inactive, banned }`), registrationsByDay, id, createdAt, updatedAt.
- **Seed**: Script (`node server/utils/seed.js`) generates analytics entries with a mix of statuses: each entry has one primary status (Active, Inactive, or Banned) via `byStatus` so the table displays corresponding status tags. New entries created via POST default to `byStatus: { active: 1, inactive: 0, banned: 0 }` (Active).

### 7. UI and frontend stack

- **Layout and theme**: MUI for Drawer, AppBar, theme (dark mode), and base components; Tailwind for spacing, grid, and overrides. Layout drawer: permanent on md+; on smaller viewports use temporary drawer with menu icon so content has full width.
- **Data and table**: TanStack Query for fetching, caching, and refetching analytics/summary; query key includes page, limit, search, status, sortBy, sortOrder so refetch runs when any change. Table displays analytics list with columns including a Status column showing tags (Active / Inactive / Banned) per row from `byStatus`; sort by createdAt or updatedAt (default newest first); server-side pagination and filters.
- **Charts**: Chart.js for bar chart (counts by status) and line chart (registrations over time); lazy-loaded with Suspense and skeleton fallbacks.
- **Global UI state**: Redux for dark mode toggle.
- **Forms**: react-hook-form + zod for the “create new entry” modal. Validation: activePlayers must be ≤ totalPlayers (zod refine); error shown on activePlayers field. Submit via `POST /api/analytics` with byStatus default Active.
- **UX**: When list refetches (filter/sort/search change), show table body skeleton and enforce a minimum delay (e.g. 1.5s) so skeleton is visible; filters remain visible. TablePagination “Rows per page” dropdown: scrollable menu, height dynamic by viewport (e.g. maxHeight with vh), open upward when near bottom so options are visible.
- **Risk**: Potential class conflicts between MUI and Tailwind — use MUI `sx` or scoped class names where needed.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-------------|
| JSON file corruption on concurrent writes | Single process server; one request at a time for write operations (no concurrent PUT/POST/DELETE). Optional: simple file lock or queue if needed later. |
| Large JSON data slows reads/writes | Acceptable for ~hundreds of entries; if it grows, replace with SQLite or external DB and keep same API. |
| Socket.IO connection drops | Client reconnects automatically; on reconnect, refetch data once so UI is in sync. |
| CORS | Express CORS middleware allowing the Vite dev origin (e.g. `http://localhost:5173`). |

## Migration Plan

- **Initial setup**: Clone/create repo; `yarn` (or npm) at root and in `client/` if needed; run seed script; `yarn dev` to start server + Vite.
- **Deploy**: Build client (`vite build`); serve `client/dist` with Express static; run server in production (e.g. single Node process). No DB migrations.
- **Rollback**: Revert code and redeploy; JSON file can be backed up/restored if required.

## Conventions and rules (Vercel best practices)

Project follows the rules installed via `skills-lock.json`: **vercel-react-best-practices** and **web-design-guidelines**. Apply them so the codebase stays understandable, reusable, and scalable.

**Reference:** `.agents/skills/vercel-react-best-practices/` (see `SKILL.md` and `AGENTS.md` for full list). Rules below are scoped to React + Vite + Express (no Next.js RSC/server actions).

### Architecture and data flow

- **Async / no waterfalls (CRITICAL):** Backend: start independent work early, `await` only when needed; use `Promise.all()` for parallel fetches (e.g. summary + list when both needed). Frontend: avoid sequential awaits; TanStack Query keys (search, filter, page, limit) keep fetches predictable.
- **Client data fetching:** Use TanStack Query for all analytics/summary GETs — gives deduplication, cache, and refetch (aligns with `client-swr-dedup`-style dedup). Pass search/filter/page/limit as query params and in the query key.
- **Minimize payload:** API responses only include fields the client needs; avoid sending full objects when a subset is enough.

### Bundle and code structure

- **Imports:** Prefer direct imports (e.g. `@mui/material/Button`) over barrel imports to keep bundles small and builds fast (`bundle-barrel-imports`).
- **Heavy components:** Lazy-load Chart.js or heavy modals with `React.lazy` / dynamic import where they are not needed on first paint (`bundle-dynamic-imports`).
- **Third-party:** Defer non-critical scripts (e.g. analytics) until after hydration (`bundle-defer-third-party`).

### Re-render and state

- **Derived state:** Compute during render, not in `useEffect`; avoid storing derived values in state (`rerender-derived-state-no-effect`).
- **Functional setState:** Use `setState(prev => ...)` when the new state depends on the previous value (`rerender-functional-setstate`).
- **Lazy state init:** Use `useState(() => expensiveInit())` for non-primitive or costly initial state (`rerender-lazy-state-init`).
- **Event handlers:** Put interaction logic (e.g. submit, search) in event handlers, not in state + effect (`rerender-move-effect-to-event`).
- **Transitions:** Use `startTransition` for non-urgent UI updates (e.g. filter/search) to keep input responsive (`rerender-transitions`).

### Rendering and lists

- **Conditional render:** Use ternary (`condition ? <A /> : null`) instead of `&&` when the value can be `0` or falsy (`rendering-conditional-render`).
- **Long lists:** Use `content-visibility: auto` (or virtualization) for long table/chart sections if needed (`rendering-content-visibility`).
- **Loading:** Prefer `useTransition` for loading states where applicable (`rendering-usetransition-loading`).

### JavaScript and backend

- **Immutability:** Use `.toSorted()`, `.toReversed()` (or spread + sort) instead of mutating arrays (`js-tosorted-immutable`).
- **Lookups:** Use `Map`/`Set` for repeated lookups; avoid repeated `.find()` in loops (`js-set-map-lookups`, `js-index-maps`).
- **Early exit:** Return early in validation and handlers to keep code readable (`js-early-exit`).

### Reusability and scalability

- **Components:** Small, single-responsibility components; reuse shared UI (StatCard, table wrapper, form fields) across the dashboard.
- **API layer:** Single API client module (e.g. `api/analytics.js`) with functions per endpoint; all params (search, filter, page, limit) in one place.
- **Types/schemas:** Shared zod schemas for API request/response and forms so validation and types stay in sync.

### Design and accessibility

- **Web-design-guidelines:** When reviewing UI, run checks against the guidelines fetched from the source in `.agents/skills/web-design-guidelines/SKILL.md` (accessibility, UX, best practices).

---

## Open Questions

- None blocking. Optional later: limit on summary time range (e.g. last 30 days for registrations).
