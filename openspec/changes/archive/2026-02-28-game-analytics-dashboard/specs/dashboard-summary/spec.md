# Spec: dashboard-summary

## ADDED Requirements

### Requirement: Analytics API — GET list with pagination, search, filter, sort

The system SHALL provide a REST endpoint `GET /api/analytics` that returns a paginated list of analytics entries plus an aggregated summary. The endpoint SHALL accept query parameters: `search` (free-text), `status` (active|inactive|banned), `dateFrom`, `dateTo`, `page`, `limit`, `sortBy` (createdAt|updatedAt), `sortOrder` (asc|desc). Default sort SHALL be newest first (e.g. `sortBy=updatedAt`, `sortOrder=desc`). The response SHALL include `items` (array of entries for the current page), `totalCount`, `totalPages`, `page`, `limit`, and `summary` (totalPlayers, activePlayers, avgPlaytimeMinutes, avgScore, byStatus, registrationsByDay). Data SHALL be computed from the current data store on each request.

#### Scenario: Get analytics with params

- **WHEN** client sends `GET /api/analytics?page=1&limit=10&sortBy=updatedAt&sortOrder=desc`
- **THEN** server responds with status 200 and a JSON object containing items, totalCount, totalPages, page, limit, and summary

#### Scenario: Summary reflects current data

- **WHEN** analytics data is updated (e.g. via `POST /api/analytics`) and client sends `GET /api/analytics`
- **THEN** the returned items and summary reflect the current state of the data store

### Requirement: Analytics API — GET aggregated summary

The system SHALL provide a REST endpoint `GET /api/analytics/summary` that returns aggregated stats (totals, averages, etc.). The response shape SHALL be consistent with or a subset of `GET /api/analytics`.

#### Scenario: Get summary

- **WHEN** client sends `GET /api/analytics/summary`
- **THEN** server responds with status 200 and a JSON object containing aggregated statistics (e.g. totalPlayers, activePlayers, avgPlaytimeMinutes, avgScore, byStatus, registrationsByDay)

### Requirement: Analytics API — POST new analytics entry

The system SHALL accept `POST /api/analytics` with a JSON body containing analytics fields (e.g. totalPlayers, activePlayers, avgPlaytimeMinutes, avgScore, byStatus, registrationsByDay). The server SHALL persist the new analytics entry and SHALL respond with 201 and the created entry (or confirmation). On validation failure the server SHALL respond with 400.

#### Scenario: Create analytics entry with valid body

- **WHEN** client sends `POST /api/analytics` with valid JSON body
- **THEN** server persists the entry, responds with status 201 and the created object (or id)

#### Scenario: Create with invalid or missing required fields

- **WHEN** client sends `POST /api/analytics` with missing or invalid required fields
- **THEN** server responds with status 400 and an error message

#### Scenario: New entry defaults to Active status

- **WHEN** client sends `POST /api/analytics` with valid body and omits `byStatus` or sends `byStatus` with all zeros
- **THEN** server persists the entry with `byStatus: { active: 1, inactive: 0, banned: 0 }` so the entry displays as Active

### Requirement: Dashboard UI — summary cards

The dashboard UI SHALL display summary statistics (e.g. total players, active players, average playtime, average score) in card components. Data SHALL be loaded from `GET /api/analytics` or `GET /api/analytics/summary`.

#### Scenario: View summary cards

- **WHEN** user navigates to the Dashboard page
- **THEN** summary cards show total players, active players, average playtime, and average score from the API

### Requirement: Dashboard UI — bar chart by status

The dashboard UI SHALL display a bar chart showing counts by status (e.g. active, inactive, banned). Data SHALL come from the analytics/summary API (e.g. `byStatus`).

#### Scenario: View bar chart

- **WHEN** user is on the Dashboard page
- **THEN** a bar chart is visible with one bar per status and counts from current data

### Requirement: Dashboard UI — line chart for registrations over time

The dashboard UI SHALL display a line (or area) chart showing registrations over time (e.g. by day or by month). Data SHALL come from `GET /api/analytics` or `GET /api/analytics/summary` (e.g. `registrationsByDay`).

#### Scenario: View registrations chart

- **WHEN** user is on the Dashboard page
- **THEN** a line chart is visible with registration counts over time (e.g. last 7 or 30 days)

### Requirement: Dashboard UI — analytics table with status tags and sort

The dashboard UI SHALL display an analytics table with columns including ID, totals, averages, a Status column, and dates. The Status column SHALL show one or more tags per row (Active, Inactive, Banned) derived from the entry’s `byStatus` (e.g. show Active tag when `byStatus.active > 0`). The table SHALL support server-side sort (e.g. by createdAt or updatedAt, default newest first), search, filter by status, and pagination with a “Rows per page” selector whose dropdown is scrollable and sized for the viewport so all options are visible.

#### Scenario: View table with status tags

- **WHEN** user is on the Dashboard page
- **THEN** the analytics table shows a Status column with Active/Inactive/Banned tags per row according to each entry’s byStatus

### Requirement: Dashboard UI — activity feed

The dashboard UI SHALL display an activity feed that shows recent analytics-related events (e.g. "New analytics entry added"). The feed SHALL update when real-time events occur (e.g. after receiving `dashboard:refresh` via Socket.IO).

#### Scenario: Activity feed updates on events

- **WHEN** analytics data is updated and the client receives `dashboard:refresh`
- **THEN** the activity feed shows the new event or the dashboard refetches and the feed reflects recent activity

### Requirement: Create entry form — validation

The create-analytics-entry form SHALL validate that activePlayers is less than or equal to totalPlayers. When the user submits with activePlayers greater than totalPlayers, the form SHALL display an error (e.g. under the Active players field) and SHALL NOT submit to the API.

#### Scenario: Submit with activePlayers > totalPlayers

- **WHEN** user enters totalPlayers = 10 and activePlayers = 15 and submits
- **THEN** the form shows a validation error (e.g. “Active players must be less than or equal to total players”) and does not call POST /api/analytics
