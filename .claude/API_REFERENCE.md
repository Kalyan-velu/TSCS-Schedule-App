# TSCS Calendar Server — API Reference

> Machine-readable reference for AI agents consuming this service.

## Overview

| Property | Value |
|---|---|
| Framework | Hono (Node.js) |
| Base URL | `http://localhost:8000` |
| OpenAPI docs | `GET /doc` |
| Default port | `8000` (override with `PORT` env var) |
| Content-Type | `application/json` (API routes) |
| CORS | `http://localhost:8080` |

## Authentication

Write operations (POST / PATCH / DELETE) on API routes require a valid session cookie (`admin_session`).

Login via `POST /ui/login` with form fields `username` and `password`. On success the server sets an `httpOnly` session cookie valid for 24 hours.

**Public (no auth needed):** all `GET` requests on `/batch/*`, `/event/*`, `/student/*`, and `/doc*`.

**Protected (session required):** all write operations on the API routes and all `/ui/*` admin pages (except `/ui/login` and `/ui/lookup`).

## Global Response Envelope

Every JSON response is wrapped in this envelope.

**Success**
```json
{ "status": true, "data": <payload> }
```

**Error**
```json
{ "status": false, "error": { "message": "<reason>" } }
```

Common HTTP error codes: `400` (validation), `404` (not found), `500` (server error).

---

## Batch Routes `/batch`

### `POST /batch/` — Create batch
**Auth:** required

**Request body**
```json
{ "name": "string" }
```

**Response 201**
```json
{ "status": true, "data": { "id": "UUID", "name": "string" } }
```

---

### `GET /batch/` — List all batches
**Auth:** none

**Response 200**
```json
{ "status": true, "data": [ { "id": "UUID", "name": "string" } ] }
```

---

### `GET /batch/:batchId` — Get batch by ID
**Auth:** none

**Path param:** `batchId` (UUID)

**Response 200**
```json
{ "status": true, "data": { "id": "UUID", "name": "string" } }
```

---

### `GET /batch/:batchId/events` — List events for a batch
**Auth:** none

**Path param:** `batchId` (UUID)

**Response 200**
```json
{
  "status": true,
  "data": [
    {
      "id": "UUID",
      "title": "string",
      "description": "string | null",
      "meetLink": "string | null",
      "scheduledAt": "ISO 8601",
      "durationMinutes": 60,
      "batchIds": ["UUID"],
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

---

### `DELETE /batch/:batchId` — Delete batch
**Auth:** required

**Path param:** `batchId` (UUID)

**Response 200**
```json
{ "status": true, "data": true }
```

---

## Event Routes `/event`

### `POST /event/` — Create event
**Auth:** required

**Request body**
```json
{
  "title": "string",
  "description": "string | null",
  "meetLink": "string | null",
  "scheduledAt": "ISO 8601",
  "durationMinutes": 60,
  "batchIds": ["UUID"]
}
```

- `batchIds` must be a non-empty array of existing batch UUIDs.
- `durationMinutes` must be a positive integer.

**Response 201**
```json
{
  "status": true,
  "data": {
    "id": "UUID",
    "title": "string",
    "description": "string | null",
    "meetLink": "string | null",
    "scheduledAt": "ISO 8601",
    "durationMinutes": 60,
    "batchIds": ["UUID"],
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
}
```

---

### `GET /event/` — List events
**Auth:** none

**Query params (all optional)**

| Param | Type | Description |
|---|---|---|
| `batchId` | UUID | Filter to events belonging to this batch |
| `from` | ISO 8601 | Start of date range (inclusive) |
| `to` | ISO 8601 | End of date range (inclusive) |

If both `from` and `to` are provided, `from` must be ≤ `to`.

**Response 200** — array of event objects (same shape as create response).

---

### `GET /event/:eventId` — Get event by ID
**Auth:** none

**Path param:** `eventId` (UUID)

**Response 200** — single event object.

---

### `DELETE /event/:eventId` — Delete event
**Auth:** required

**Path param:** `eventId` (UUID)

**Response 200**
```json
{ "status": true, "data": true }
```

---

### `POST /event/:eventId/batches` — Assign event to batches
**Auth:** required

**Path param:** `eventId` (UUID)

**Request body**
```json
{ "batchIds": ["UUID"] }
```

**Response 200** — updated event object.

---

## Student Routes `/student`

### `POST /student/` — Create student
**Auth:** required

**Request body**
```json
{
  "displayName": "string",
  "email": "user@example.com",
  "batchId": "UUID | null",
  "pushToken": "string | null"
}
```

**Response 201**
```json
{
  "status": true,
  "data": {
    "id": "UUID",
    "displayName": "string",
    "email": "string",
    "batchId": "UUID | null",
    "pushToken": "string | null",
    "createdAt": "ISO 8601"
  }
}
```

Duplicate email returns `400`.

---

### `GET /student/` — List all students
**Auth:** none

**Response 200** — array of student objects. Each item also includes a `batchName` field (joined from the batch table).

---

### `GET /student/:studentId` — Get student by ID
**Auth:** none

**Path param:** `studentId` (UUID)

**Response 200** — single student object.

---

### `PATCH /student/:studentId` — Update student
**Auth:** required

**Path param:** `studentId` (UUID)

**Request body** (all fields optional)
```json
{
  "displayName": "string",
  "email": "user@example.com",
  "batchId": "UUID | null",
  "pushToken": "string | null"
}
```

**Response 200** — updated student object.

---

### `DELETE /student/:studentId` — Delete student
**Auth:** required

**Path param:** `studentId` (UUID)

**Response 200**
```json
{ "status": true, "data": true }
```

---

## Public UI Routes (HTML)

These routes return server-rendered HTML and are intended for browser use. Two of them are useful as shareable public links.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/ui/lookup` | none | Email lookup form — student enters email to find their schedule |
| `POST` | `/ui/lookup` | none | Submits email; redirects to weekly schedule or shows error |
| `GET` | `/ui/batches/:batchId/events` | none | Weekly schedule for a batch; accepts optional `?date=YYYY-MM-DD` to navigate weeks |

---

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | no | `8000` | Server listen port |
| `SESSION_SECRET` | yes | — | Signs session cookies |
| `ADMIN_USERNAME` | no | `admin` | Admin login username |
| `ADMIN_PASSWORD` | no | `admin123` | Admin login password |

---

## Quick-start for an AI agent

1. **Read data** — all `GET` endpoints are open; no auth header needed.
2. **Write data** — call `POST /ui/login` first (form-data body: `username`, `password`), extract the `admin_session` cookie from the response, then send it on all subsequent write requests.
3. **Create an event** — you must have at least one batch. Create a batch → note its `id` → create an event with that id in `batchIds`.
4. **Explore the schema** — visit `/doc` for the full OpenAPI specification.
