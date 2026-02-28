# Tasks: Game Analytics Mini Dashboard (Summary Only)

## 1. Project scaffold

- [x] 1.1 Create root package.json with concurrently script to run server and client
- [x] 1.2 Initialize Express server in server/ with entry point (index.js) and CORS for Vite dev origin
- [x] 1.3 Initialize Vite + React app in client/ with React Router, Tailwind CSS, MUI.
- [x] 1.4 Add dependencies: server (express, cors, socket.io), client (axios, socket.io-client, TanStack Table, TanStack Query, Chart.js for create simple chart (Chart/Visualization), Redux for manage state, react-hook-form, zod for handling form);

## 2. Backend — data store and analytics API

- [x] 2.1 Create server/data/ (e.g. analytics.json and/or players.json for read-only seed) and a small helper to read/write analytics data
- [x] 2.2 Implement GET /api/analytics (returns list + summary from data store) with **search**, **filter**, **pagination**, and **sort**: query params e.g. `search`, `status`, `dateFrom`/`dateTo`, `page`, `limit`, `sortBy`, `sortOrder`; apply search/filter, sort (default updatedAt desc), then paginate; response includes items, totalCount, totalPages, page, limit, summary
- [x] 2.3 Implement GET /api/analytics/summary (returns aggregated stats; same shape or subset as GET /api/analytics)
- [x] 2.4 Implement POST /api/analytics (body: analytics entry; persist, then emit dashboard:refresh via Socket.IO; return 201)
- [x] 2.5: Handle basic validation and error handling

## 3. Backend — Socket.IO

- [x] 3.1 Attach Socket.IO to Express server; emit dashboard:refresh after each successful POST /api/analytics

## 4. Seed data

- [x] 4.1 Add seed script (e.g. server/utils/seed.js) that generates initial data (e.g. players.json for computation or analytics.json with sample entries) so GET /api/analytics and GET /api/analytics/summary return meaningful data
- [x] 4.2 Add npm script to run seed (e.g. node server/utils/seed.js)

## 5. Frontend — layout and API client

- [x] 5.1 Configure MUI theme (e.g. dark) and Tailwind; add layout with Sidebar (nav to Dashboard only) and Header
- [x] 5.2 Create API client (axios) for GET /api/analytics (accept params: search, status, page, limit, sortBy, sortOrder), GET /api/analytics/summary, and POST /api/analytics; base URL from env or default
- [x] 5.3 Create Socket.IO client singleton and useSocket hook that subscribes to dashboard:refresh and triggers refetch of analytics/summary

## 6. Frontend — Dashboard page

- [x] 6.1 Dashboard page: fetch summary from GET /api/analytics or GET /api/analytics/summary and show 4 StatCards (total players, active players, avg playtime, avg score)
- [x] 6.2: Config TanStack Query and implement TanStack Query to render list/data from backend; pass **search**, **filter**, **page**, **limit** to GET /api/analytics (query key includes these so refetch runs when search/filter/pagination change)
- [x] 6.3: Use TanStack Table to display analytics data with **search** (e.g. search input, debounced), **filter** (e.g. status dropdown, date range), and **pagination** (controls + page size selector); all drive server-side API params and table state
- [x] 6.4 Add bar chart (Chart.js) for counts by status using summary.byStatus
- [x] 6.5 Add line chart (Chart.js) for registrations over time using summary.registrationsByDay
- [x] 6.6 Add ActivityFeed component that updates when dashboard:refresh is received (or shows recent analytics events) 
- [x] 6.7: Use Redux for manage state about Dark Mode Toggle
- [x] 6.8: Use WebSocket or polling for live data refresh

## 7. Frontend - Create new entry modal

- [x] 7.1 Create UI for create new entry modal and use react-hook-form for validating and handling fields in form
- [x] 7.2 Use API POST /api/analytics for submit
- [x] 7.3 Add zod refine: activePlayers ≤ totalPlayers; show error on activePlayers field when violated

## 8. Backend — sort and default status

- [x] 8.1 GET /api/analytics supports sortBy (createdAt|updatedAt) and sortOrder (asc|desc); default sort newest first (updatedAt desc)
- [x] 8.2 POST /api/analytics: new entries default byStatus to { active: 1, inactive: 0, banned: 0 } when not provided or all zeros
- [x] 8.3 Seed script generates entries with mix of statuses (Active, Inactive, Banned) via byStatus per entry

## 9. Frontend — table status tags and UX

- [x] 9.1 Analytics table: add Status column with tags (Active / Inactive / Banned) per row from entry.byStatus
- [x] 9.2 Table: sort controls (Sort by, Order) drive API params; query key includes sortBy/sortOrder for refetch
- [x] 9.3 On list refetch (filter/sort/search change): show table body skeleton (isRefetching); optional min delay (e.g. 1.5s) so skeleton visible
- [x] 9.4 TablePagination: rowsPerPageOptions responsive by viewport (e.g. fewer on small screens); dropdown menu with scroll, dynamic maxHeight (vh), open upward so all options visible

## 10. Frontend — responsive layout

- [x] 10.1 Layout: drawer temporary on viewports &lt; md with menu icon; permanent on md+
- [x] 10.2 Dashboard page: responsive padding and grid; charts lazy-loaded with Suspense and skeleton fallbacks
- [x] 10.3 All Select/dropdown menus (filters, TablePagination): scrollable with maxHeight and overflow so options not cut off

## 11. Polish

- [x] 11.1 Ensure responsive layout and loading/error states for API calls
- [x] 11.2 Add basic error handling and user feedback (e.g. snackbar on POST /api/analytics success or failure)

## 12. Conventions (Vercel best practices)

- [x] 12.1 Follow rules in `design.md` § Conventions and rules: direct imports, no async waterfalls (parallel fetches), TanStack Query for dedup/cache, functional setState and derived state during render, event-handler logic in handlers, ternary for conditionals, immutable array helpers, Map/Set for lookups where applicable
- [x] 12.2 Apply web-design-guidelines when reviewing UI (accessibility, UX); reference `.agents/skills/web-design-guidelines/SKILL.md` and `.agents/skills/vercel-react-best-practices/AGENTS.md` as needed
