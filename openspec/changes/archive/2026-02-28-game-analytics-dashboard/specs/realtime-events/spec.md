# Spec: realtime-events

## ADDED Requirements

### Requirement: Socket.IO server emits events on analytics change

The backend SHALL attach a Socket.IO server to the same process as the Express API. After every successful creation of an analytics entry (e.g. via `POST /api/analytics`), the server SHALL emit a `dashboard:refresh` event to all connected clients so that the dashboard can refetch summary data.

#### Scenario: Emit on analytics create

- **WHEN** an analytics entry is successfully created via `POST /api/analytics`
- **THEN** the server emits `dashboard:refresh` to connected Socket.IO clients

### Requirement: Frontend subscribes to Socket.IO events

The frontend SHALL connect to the Socket.IO server (e.g. same origin or configured URL). The frontend SHALL subscribe to `dashboard:refresh`. When this event is received, the client SHALL update the dashboard UI so that summary and charts reflect the latest data (e.g. by refetching `GET /api/analytics` or `GET /api/analytics/summary`).

#### Scenario: Dashboard updates after event

- **WHEN** the client is on the Dashboard page and receives a `dashboard:refresh` event
- **THEN** the client refetches analytics/summary and updates the displayed cards and charts
