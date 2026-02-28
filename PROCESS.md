# Process Documentation (PROCESS.md)

This document describes how the Game Analytics Mini Dashboard was planned, built, and tested, including tech choices, AI tool usage, workflow, and trade-offs.

---

## Tech Stack Choice

### Which libraries/frameworks did you use? Why?

| Area | Choice | Why |
|------|--------|-----|
| **Backend** | Express.js | Simple, widely used, minimal setup. Fits a small API with a few routes and Socket.IO attachment. |
| **API transport** | REST + Socket.IO | REST for CRUD and listing; Socket.IO for real-time `dashboard:refresh` after new entries so the UI updates without polling. |
| **Data store** | JSON file (`fs`) | No DB setup; good for a prototype and local dev. Data in `backend/data/analytics.json`. |
| **Frontend** | React 19 + Vite | Vite for fast dev and build; React for components and ecosystem. |
| **UI** | MUI + Tailwind | MUI for layout (Drawer, AppBar, Table, Dialog, theme) and consistency; Tailwind for spacing and overrides. |
| **Data fetching** | TanStack Query | Caching, refetch on key change (page, filter, sort). Fits server state and Socket invalidation. |
| **Tables** | TanStack Table | Flexible table with controlled pagination/filter/sort; we use server-side params and MUI Table for rendering. |
| **Charts** | Chart.js + react-chartjs-2 | Lightweight, responsive; used for bar chart (by status) and line chart (registrations). |
| **Forms** | react-hook-form + Zod | Performant forms; Zod for schema and validation (e.g. activePlayers ≤ totalPlayers). |
| **Global UI state** | Redux Toolkit | Single slice for dark mode toggle; simple and predictable. |
| **Testing** | Node `node:test` + supertest (backend), Vitest (frontend) | Built-in runner for API tests; Vitest fits Vite and component/schema tests. |

### What alternatives did you consider?

- **Next.js / API routes** — Rejected to keep a clear split between Express API and React app and to avoid RSC/SSR complexity for this scope.
- **Recharts** — Considered; Chart.js chosen for smaller bundle and straightforward bar/line usage.
- **SQLite / Prisma** — Would improve querying and scaling; deferred to keep the prototype DB-free and file-based.
- **SWR** — TanStack Query chosen for more control over keys and invalidation (e.g. after Socket events).
- **Formik / Yup** — react-hook-form + Zod chosen for performance and type-safe validation with refine (cross-field rules).

---

## AI Tool Usage

### Which AI tool(s) did you use?

- **Cursor** (AI-assisted editor) for code generation, refactors, tests, and documentation.
- **OpenSpec-style workflow** (proposal → design → specs → tasks) to structure the change and align AI output with requirements.

### Share 5–10 examples of prompts you used (with context)

1. **Scoping**  
   *"Build a Mini Dashboard for Game Analytics that displays real-time data and allows basic CRUD operations."*  
   → Led to proposal with dashboard summary, table, charts, and create-entry flow.

2. **API design**  
   *"I've changed the requirements: show summary statistics only, no player CRUD. Please read the OpenSpec files carefully; I've updated the API Shape section."*  
   → Updated OpenSpec and API to GET/POST analytics only, no players CRUD.

3. **Implementation**  
   *"Implement the plan as specified… Do NOT edit the plan file. Mark todos as in_progress as you work."*  
   → Guided step-by-step implementation from tasks (backend routes, frontend pages, Socket, seed).

4. **Feature**  
   *"Implement pagination for rendering the list data."*  
   → Added server-side pagination (page, limit) and table pagination UI.

5. **Validation**  
   *"In CreateEntryModal I need an additional constraint: activePlayers must be less than or equal to totalPlayers for the entry to be created; otherwise show an error."*  
   → Added Zod `.refine()` and error on `activePlayers` field.

6. **UX**  
   *"When changing filter or sort values the list jitters. Can you apply a skeleton when filter/sort values change?"*  
   → Introduced `isRefetching` skeleton and optional min delay for list refetch.

7. **Tests**  
   *"Write test cases for the OpenSpec files and automate the tests for me."*  
   → Derived API tests (supertest) and frontend schema tests (Vitest) from specs; added `docs/TEST_CASES.md`.

8. **Docs**  
   *"README.md must include: Prerequisites, How to run backend, How to run frontend, API endpoints documentation."*  
   → Restructured README with prerequisites, run instructions, and API table.

**UI/UX decisions**

9. **Responsive**  
    *"Apply responsive layout for the dashboard page: drawer temporary on mobile with menu button, padding and grid by breakpoint. Keep all existing logic unchanged."*  
    → Layout drawer becomes temporary on small viewports; dashboard grid and table use responsive spacing and columns.

10. **Status tags**  
    *"Design UI tags for each status (Active, Inactive, Banned) per row in the analytics table so users can see at a glance which status each entry has."*  
    → Added Status column with MUI Chips (success / warning / error) driven by `byStatus` on each entry.

11. **Dropdown UX**  
    *"The TablePagination 'Rows per page' dropdown is cut off on small screens. Add scroll and set height dynamically from viewport so all options are visible."*  
    → MenuProps with maxHeight (vh), overflow scroll, and open upward so the dropdown stays on screen.

12. **Loading state**  
    *"When changing filter/sort, add a minimum delay (e.g. 1s) before updating the list so the skeleton is visible and the UI feels less janky."*  
    → Optional min delay in list queryFn after first load so refetch always shows skeleton briefly.

**TanStack Query & Table**

13. **TanStack Query — refetch on sort/filter**  
    *"Use TanStack Query for the analytics list with queryKey that includes page, limit, search, status, sortBy, and sortOrder so changing any of these triggers a refetch."*  
    → Query key as array of primitives; list refetches when sort or filter changes; no stale key from object reference.

16. **TanStack Query — invalidation on Socket**  
    *"When the client receives dashboard:refresh from Socket.IO, invalidate the analytics list and summary queries so the UI refetches and shows new data."*  
    → useSocketRefresh invalidates relevant query keys; TanStack Query refetches in background.

17. **TanStack Table — server-side pagination**  
    *"Render the analytics table with server-side pagination: table only displays the current page from the API; use external page/limit state and TablePagination, not TanStack Table's built-in row model."*  
    → Table receives `data` as current page only; page/limit/totalCount and handlers passed as props; no getPaginationRowModel.

### What worked well with AI assistance?

- Generating boilerplate (Express routes, React components, MUI layout) from short descriptions.
- Aligning code with written specs (e.g. query params, response shape, validation rules).
- Refactoring and renaming (e.g. folder structure, script names) across many files.
- Writing tests from spec scenarios and keeping TEST_CASES.md in sync.
- Updating README and PROCESS.md with consistent structure and wording.

### What didn’t work? How did you fix it?

- **Sort/filter not updating list** — Query key and param serialization were wrong. Fixed by using primitive query keys and `URLSearchParams` for `getAnalytics`, and normalizing sort params on the backend.
- **TablePagination dropdown cut off** — Menu overflow on small screens. Fixed with `MenuProps` (maxHeight, overflow, anchorOrigin/transformOrigin) so the dropdown scrolls and opens upward when needed.
- **First-time edits** — Some search_replace failed due to formatting (e.g. package.json). Fixed by reading the file and applying edits with exact strings or using `Write` for full content.

### Time saved estimate: How much faster did AI make you?

Rough estimate: **40–50%** faster for this project.  
AI sped up: scaffolding, repetitive UI (table, filters, modals), test writing from specs, and doc updates. Manual work was still needed for: debugging (sort/filter, dropdown), wiring Socket + Query invalidation, and deciding where to put logic (e.g. skeleton vs. full reload).

---

## Development Workflow

### Step-by-step process (planning → setup → build → test)

1. **Planning (OpenSpec)**  
   - Proposal: scope (dashboard only), capabilities, impact.  
   - Design: stack, API shape, data store, real-time, UI layout, conventions.  
   - Specs: dashboard-summary (API + UI), realtime-events; player-crud marked out of scope.  
   - Tasks: ordered checklist (scaffold → backend → seed → frontend → polish → tests).

2. **Setup**  
   - Root: `package.json` with concurrently, seed script.  
   - Backend: Express, CORS, Socket.IO, routes, `backend/data/`, store helpers.  
   - Frontend: Vite + React, Router, Tailwind, MUI, TanStack Query/Table, Chart.js, Redux, react-hook-form, zod.  
   - Repo layout: `backend/`, `frontend/`, later `docs/`, root `.gitignore`.

3. **Backend**  
   - Store (read/write JSON), summary util, seed script.  
   - Routes: GET /api/analytics (filter, sort, paginate, summary), GET /api/analytics/summary, POST /api/analytics (validate, default byStatus).  
   - Socket.IO: emit `dashboard:refresh` after POST.  
   - Env: `ANALYTICS_DATA_DIR` for tests; `NODE_ENV=test` to avoid listen in tests.

4. **Frontend**  
   - Layout: Drawer (responsive), AppBar, dark mode toggle (Redux).  
   - Dashboard: StatCards, ChartsSection (lazy), AnalyticsTable (filters, sort, pagination, status tags), ActivityFeed, CreateEntryModal.  
   - API client + TanStack Query; Socket hook to invalidate queries.  
   - Skeletons and refetch skeleton; TablePagination dropdown UX.

5. **Integration**  
   - Vite proxy to backend (:3001).  
   - Seed data and manual check of list/summary/create/real-time.  
   - Fixes for sort/filter and dropdown as above.

6. **Testing**  
   - Backend: supertest + Node test runner; fixture data; tests for GET/POST, validation, default byStatus.  
   - Frontend: Vitest + createEntrySchema tests (activePlayers ≤ totalPlayers).  
   - Root: `npm test` runs backend and frontend tests.  
   - `docs/TEST_CASES.md` lists scenarios and commands.

### Time breakdown (estimates)

| Phase | Estimate |
|-------|----------|
| Setup (monorepo, backend/frontend init, deps) | 30 min |
| Backend (store, routes, validation, Socket, seed) | 45 min |
| Frontend (layout, dashboard, table, charts, modal, Socket) | 45 min |
| Integration (proxy, real-time, UX fixes) | 60 min |
| Testing (API tests, schema tests, TEST_CASES.md) / self test | 30 min |
| Docs & process (README, PROCESS.md, OpenSpec updates) | 15 min |

Total rough range: **3–4 hours** (with AI assistance).

---

## Technical Decisions

### Key decisions

- **Server state in TanStack Query, UI state in React + Redux**  
  - Query for list/summary; Redux only for dark mode. Keeps server cache and invalidation in one place.

- **Validation: Zod on frontend and ad-hoc on backend**  
  - Zod schema + refine for activePlayers ≤ totalPlayers; backend uses simple validators for types and required fields. No shared schema package to keep setup minimal.

- **Real-time: Socket.IO + query invalidation**  
  - Backend emits `dashboard:refresh`; frontend invalidates list/summary queries so data refetches. No payload in the event.

- **Pagination and sort on server**  
  - All list data filtered/sorted/paginated in backend; frontend sends page, limit, search, status, sortBy, sortOrder. Table is “dumb” and displays current page only.

- **Express for the backend**  
  - Express is used to manage the API: routing (`/api/analytics`, `/api/analytics/summary`), middleware (CORS, JSON body parser), and attachment of Socket.IO to the same HTTP server. No separate API framework; keeps the backend simple and easy to run with `node index.js`.

- **TanStack Table for the analytics list**  
  - TanStack Table is used to structure the table (columns, header, body) and to keep sorting/filter state consistent with the UI. Pagination is driven by server-side params (page, limit) and external state, not TanStack Table’s built-in pagination model, so the table only renders the current page from the API.

- **Lazy load for heavy UI**  
  - Chart components (e.g. ChartsSection, bar/line charts) are loaded with `React.lazy()` and wrapped in `Suspense` with skeleton fallbacks. The dashboard shell and list load first; charts load when needed, reducing initial bundle and improving perceived performance.

### Trade-offs to ship in time

- **JSON file instead of DB** — Faster to implement; acceptable for prototype. Concurrency and size limits accepted.
- **No shared TypeScript types** — frontend uses Zod and prop types. Would add a shared package with more time.
- **Limited E2E** — Only API and one frontend schema test automated. No Playwright/Cypress; manual check for full flows.
- **Refetch delay (e.g. 1.5s) for skeleton** — Artificial delay so skeleton is visible when API is fast; could be removed or made optional later.

### What you’d improve with more time

- Add **E2E tests** (e.g. Playwright) for: load dashboard, filter/sort, create entry, see refresh.
- **Shared types or OpenAPI** for request/response so backend and frontend stay in sync.
- **Rate limiting and input sanitization** on the API.
- **SQLite (or similar)** for larger datasets and safer concurrent writes.
- **Accessibility audit** (focus, ARIA, keyboard) and fix issues.
- **Error boundaries and retry** for failed fetches and Socket reconnect.

---

## Results & Limitations

### What works well?

- Dashboard loads summary cards, bar chart, line chart, and paginated table from the API.
- Search, status filter, sort (createdAt/updatedAt, asc/desc), and pagination work and are reflected in the URL/params.
- Create-entry modal validates (including activePlayers ≤ totalPlayers) and POST creates an entry; new rows appear with Active tag when byStatus is omitted.
- Socket.IO: after POST, backend emits `dashboard:refresh`; frontend invalidates and refetches so list and summary update.
- Responsive layout: drawer becomes temporary on small viewports; table and dropdowns scroll and adapt.
- Skeleton and refetch state improve perceived performance when changing filters/sort.
- Backend and frontend tests run via `npm test`; TEST_CASES.md documents scenarios.
- README explains prerequisites, how to run backend and frontend, and API endpoints.

### What doesn’t work or is incomplete?

- **No auth** — API is open; not suitable for production as-is.
- **Single process** — No clustering; one Node process. File writes are not safe under heavy concurrent POST.
- **Date filter** — Backend supports `dateFrom`/`dateTo` but the frontend table does not expose date-range filters yet.
- **Registrations chart** — Uses `registrationsByDay` from summary; seed data has empty arrays, so chart is often “No registration data”.

### Known bugs or edge cases

- **Sort/filter** — Fixed in current code; earlier versions had wrong query keys or param handling.
- **TablePagination dropdown** — On very small viewports, menu position might still be tight; current fix uses scroll and upward opening.
- **Fixture restore** — Backend tests restore `test/fixtures/analytics.json` after each mutating test; if a test fails mid-run, fixture might be left modified.
- **Dark mode** — Stored in Redux only; not persisted to localStorage, so it resets on reload.

---

*Last updated to reflect the current backend/frontend structure, OpenSpec-driven workflow, and AI-assisted development.*
