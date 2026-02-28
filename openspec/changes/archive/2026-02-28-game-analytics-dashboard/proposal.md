# Proposal: Game Analytics Mini Dashboard

## Why

Teams need a lightweight way to view game analytics summary (totals, averages, and aggregated metrics) in one place. A mini dashboard that displays real-time summary statistics reduces context-switching without deploying a full analytics platform. Player-level CRUD is out of scope for this change.

## What Changes

- **New application**: A full-stack mini dashboard (React frontend + Express backend) with no existing codebase to modify.
- **Backend**: Express server with analytics API only: `GET /api/analytics`, `GET /api/analytics/summary`, `POST /api/analytics`; JSON file as data store; Socket.IO for real-time events when analytics data changes.
- **Frontend**: Single Dashboard page showing summary statistics (cards, bar chart by status, line chart for registrations over time, activity feed). No Players page or player CRUD UI.
- **Real-time**: Live updates to the dashboard when analytics data changes (e.g. after `POST /api/analytics`), via WebSocket (Socket.IO).
- **Data**: Analytics entries or computed summary from stored data (e.g. from `players.json` as read-only source for computation). Seed script for initial data.

## Capabilities

### New Capabilities

- **dashboard-summary**: API and UI for aggregated game analytics. Backend exposes `GET /api/analytics` (list with search, filter, pagination, sort + summary), `GET /api/analytics/summary` (aggregated stats), and `POST /api/analytics` (create new analytics entry). Frontend shows summary cards, bar chart by status, line chart (registrations over time), analytics table with status tags (Active/Inactive/Banned), sort, and activity feed. Create-entry modal validates that activePlayers ≤ totalPlayers.
- **realtime-events**: Socket.IO server integration and client subscription. Server emits `dashboard:refresh` when analytics data changes (e.g. after `POST /api/analytics`); frontend listens and refreshes dashboard summary without full page reload.

### Out of Scope (not in this change)

- **player-crud**: No REST API or UI for player list, create, update, or delete. Summary statistics only.

### Modified Capabilities

- _(None — greenfield project.)_

## Impact

- **New codebase**: New `server/` and `client/` directories; root `package.json` with workspace or concurrently to run both.
- **Dependencies**: Express, Socket.IO, Axios, React, Vite, Tailwind CSS, MUI, Chart.js, TanStack Query, TanStack Table, Redux, react-hook-form, zod. No existing systems or APIs affected.
- **Data**: JSON file(s) for analytics/summary (and optionally read-only seed data); no external database or credentials required for initial rollout.
