# Takshashila SCS Scheduler API Documentation

This document describes all the JSON REST API and Interactive UI endpoints in the TSCS Scheduler application, including payloads, query parameters, responses, and authorization rules.

---

## Base Configuration
- **Base URL**: `http://localhost:8000` (default)
- **API Spec Doc**: `http://localhost:8000/docs` (Swagger UI / OpenAPI spec page)

---

## 1. Batch API Endpoints (`/batch`)

Manage class cohort groups.

### Create a Batch
* **Route**: `POST /batch`
* **Request Body**:
  ```json
  {
    "name": "UPSC General Studies Batch A"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "name": "UPSC General Studies Batch A",
      "createdAt": "2026-06-03T13:00:00.000Z",
      "updatedAt": "2026-06-03T13:00:00.000Z"
    }
  }
  ```

### List All Batches
* **Route**: `GET /batch`
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "name": "UPSC General Studies Batch A",
        "createdAt": "2026-06-03T13:00:00.000Z",
        "updatedAt": "2026-06-03T13:00:00.000Z"
      }
    ]
  }
  ```

### Get Batch Details by ID
* **Route**: `GET /batch/{batchId}`
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "name": "UPSC General Studies Batch A",
      "createdAt": "2026-06-03T13:00:00.000Z",
      "updatedAt": "2026-06-03T13:00:00.000Z"
    }
  }
  ```

### List Batch Events
Get all events assigned to a specific batch.
* **Route**: `GET /batch/{batchId}/events`
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": "e2cda299-9c0b-4ef8-bb6d-6bb9bd380b22",
        "title": "History Lecture 1",
        "description": "Introduction to Ancient Indian History",
        "meetLink": "https://meet.google.com/abc-defg-hij",
        "scheduledAt": "2026-06-05T10:00:00.000Z",
        "durationMinutes": 90,
        "groupId": null,
        "recurrencePattern": null,
        "recurrenceEndDate": null,
        "createdAt": "2026-06-03T13:05:00.000Z",
        "updatedAt": "2026-06-03T13:05:00.000Z"
      }
    ]
  }
  ```

### Delete a Batch
* **Route**: `DELETE /batch/{batchId}`
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": true
  }
  ```

---

## 2. Event API Endpoints (`/event`)

Manage calendar events and link them to batches.

### Create an Event
Create a new schedule item. If recurrence parameters are provided, it automatically generates the individual recurring instances under a single database transaction.
* **Route**: `POST /event`
* **Request Body**:
  ```json
  {
    "title": "Modern History Seminar",
    "description": "Special session on the Indian National Movement",
    "meetLink": "https://meet.google.com/xyz-pdqr-abc",
    "scheduledAt": "2026-06-08T14:30:00.000Z",
    "durationMinutes": 60,
    "batchIds": ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"],
    "recurrencePattern": "MON,WED,FRI",
    "recurrenceEndDate": "2026-06-30T23:59:59.000Z"
  }
  ```
  - **`recurrencePattern`** options:
    - `"DAILY"`: Everyday.
    - `"WEEKLY"`: Once a week on the same day.
    - Custom comma-separated list of weekdays (e.g. `"MON,WED,FRI"` or `"Tuesday,Thursday"`).
  - **`recurrenceEndDate`**: ISO Datetime string indicating the end of the series.

* **Success Response (201 Created)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "d0eebc88-1c2d-4ef8-bb6d-6bb9bd380c55",
      "title": "Modern History Seminar",
      "description": "Special session on the Indian National Movement",
      "meetLink": "https://meet.google.com/xyz-pdqr-abc",
      "scheduledAt": "2026-06-08T14:30:00.000Z",
      "durationMinutes": 60,
      "groupId": "f8d8b9bb-2c3d-4e9b-a010-6cc9bd380e22",
      "recurrencePattern": "MON,WED,FRI",
      "recurrenceEndDate": "2026-06-30T23:59:59.000Z",
      "createdAt": "2026-06-03T13:10:00.000Z",
      "updatedAt": "2026-06-03T13:10:00.000Z"
    }
  }
  ```

### List Events
List all events. Supports optional query filters.
* **Route**: `GET /event`
* **Query Parameters**:
  - `batchId` (optional): Filter events by assigned cohort.
  - `from` (optional): ISO datetime string, start of date window.
  - `to` (optional): ISO datetime string, end of date window.
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": "d0eebc88-1c2d-4ef8-bb6d-6bb9bd380c55",
        "title": "Modern History Seminar",
        "description": "Special session on the Indian National Movement",
        "meetLink": "https://meet.google.com/xyz-pdqr-abc",
        "scheduledAt": "2026-06-08T14:30:00.000Z",
        "durationMinutes": 60,
        "groupId": "f8d8b9bb-2c3d-4e9b-a010-6cc9bd380e22",
        "recurrencePattern": "MON,WED,FRI",
        "recurrenceEndDate": "2026-06-30T23:59:59.000Z",
        "createdAt": "2026-06-03T13:10:00.000Z",
        "updatedAt": "2026-06-03T13:10:00.000Z"
      }
    ]
  }
  ```

### Get Event Details by ID
* **Route**: `GET /event/{eventId}`
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "d0eebc88-1c2d-4ef8-bb6d-6bb9bd380c55",
      "title": "Modern History Seminar",
      "description": "Special session on the Indian National Movement",
      "meetLink": "https://meet.google.com/xyz-pdqr-abc",
      "scheduledAt": "2026-06-08T14:30:00.000Z",
      "durationMinutes": 60,
      "groupId": "f8d8b9bb-2c3d-4e9b-a010-6cc9bd380e22",
      "recurrencePattern": "MON,WED,FRI",
      "recurrenceEndDate": "2026-06-30T23:59:59.000Z",
      "createdAt": "2026-06-03T13:10:00.000Z",
      "updatedAt": "2026-06-03T13:10:00.000Z"
    }
  }
  ```

### Update an Event
Update event details. Supports single-instance exception detaching or series-wide rescheduling.
* **Route**: `PATCH /event/{eventId}`
* **Request Body** (all fields optional):
  ```json
  {
    "title": "Updated Seminar Title",
    "scheduledAt": "2026-06-08T15:00:00.000Z",
    "batchIds": ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"],
    "editScope": "future"
  }
  ```
  - **`editScope`** options:
    - `"single"` (default): Updates only this specific event instance, and detaches it from the series (sets its `groupId = null` so it becomes a standalone exception).
    - `"future"`: Updates this and all future occurrences in the series, relative to their original schedules by calculating and shifting dates by a matching offset duration.

* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "d0eebc88-1c2d-4ef8-bb6d-6bb9bd380c55",
      "title": "Updated Seminar Title",
      "description": "Special session on the Indian National Movement",
      "meetLink": "https://meet.google.com/xyz-pdqr-abc",
      "scheduledAt": "2026-06-08T15:00:00.000Z",
      "durationMinutes": 60,
      "groupId": "f8d8b9bb-2c3d-4e9b-a010-6cc9bd380e22",
      "recurrencePattern": "MON,WED,FRI",
      "recurrenceEndDate": "2026-06-30T23:59:59.000Z",
      "createdAt": "2026-06-03T13:10:00.000Z",
      "updatedAt": "2026-06-03T13:12:00.000Z"
    }
  }
  ```

### Assign Event to Batches
Overwrite batch assignments for an event.
* **Route**: `POST /event/{eventId}/batches`
* **Request Body**:
  ```json
  {
    "batchIds": ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"]
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "d0eebc88-1c2d-4ef8-bb6d-6bb9bd380c55",
      "title": "Modern History Seminar",
      "description": "Special session on the Indian National Movement",
      "meetLink": "https://meet.google.com/xyz-pdqr-abc",
      "scheduledAt": "2026-06-08T14:30:00.000Z",
      "durationMinutes": 60,
      "createdAt": "2026-06-03T13:10:00.000Z",
      "updatedAt": "2026-06-03T13:15:00.000Z"
    }
  }
  ```

### Delete an Event
* **Route**: `DELETE /event/{eventId}`
* **Query Parameters**:
  - `scope` (optional):
    - `"instance"` (default): Deletes only this specific event instance.
    - `"series"`: Deletes the entire repeated series sharing the same `groupId`.
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": true
  }
  ```

---

## 3. Student API Endpoints (`/student`)

Manage student enrollments and authentication.

### Create a Student
* **Route**: `POST /student`
* **Request Body**:
  ```json
  {
    "displayName": "Priom Borah",
    "email": "priom@tscs.com",
    "password": "securestudentpassword",
    "batchId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "pushToken": "token123"
  }
  ```
* **Success Response (201 Created)**:
  *(Note: `passwordHash` is excluded from JSON API responses for security)*
  ```json
  {
    "status": true,
    "data": {
      "id": "c0eebc00-2c2d-4ef8-bb6d-6bb9bd380d99",
      "displayName": "Priom Borah",
      "email": "priom@tscs.com",
      "batchId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "pushToken": "token123",
      "createdAt": "2026-06-03T13:20:00.000Z"
    }
  }
  ```

### List All Students
* **Route**: `GET /student`
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": "c0eebc00-2c2d-4ef8-bb6d-6bb9bd380d99",
        "displayName": "Priom Borah",
        "email": "priom@tscs.com",
        "batchId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "pushToken": "token123",
        "createdAt": "2026-06-03T13:20:00.000Z",
        "batchName": "UPSC General Studies Batch A"
      }
    ]
  }
  ```

### Get Student Details by ID
* **Route**: `GET /student/{studentId}`
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "c0eebc00-2c2d-4ef8-bb6d-6bb9bd380d99",
      "displayName": "Priom Borah",
      "email": "priom@tscs.com",
      "batchId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "pushToken": "token123",
      "createdAt": "2026-06-03T13:20:00.000Z"
    }
  }
  ```

### Update Student Info
* **Route**: `PATCH /student/{studentId}`
* **Request Body** (all fields optional):
  ```json
  {
    "displayName": "Priom Borah Updated",
    "password": "newsecurepassword"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "c0eebc00-2c2d-4ef8-bb6d-6bb9bd380d99",
      "displayName": "Priom Borah Updated",
      "email": "priom@tscs.com",
      "batchId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "pushToken": "token123",
      "createdAt": "2026-06-03T13:20:00.000Z"
    }
  }
  ```

### Delete a Student
* **Route**: `DELETE /student/{studentId}`
* **Success Response (200 OK)**:
  ```json
  {
    "status": true,
    "data": true
  }
  ```

---

## 4. Web UI Portals (`/ui`)

Interactive HTMX-driven Web Interfaces.

### Administrator Portal login
- **Route**: `GET /ui/login` (renders form) / `POST /ui/login` (submits credentials)
- **Session Cookie Set**: `admin_session`

### Administrator Dashboards
Protected by Admin Session Cookie verification.
- **Events Registry**: `GET /ui/events`
- **Cohort Batches**: `GET /ui/batches`
- **Student Directory**: `GET /ui/students` (Admin can set/change passwords here)

### Student Portal login
- **Route**: `GET /ui/lookup` (renders sign-in form) / `POST /ui/lookup` (verifies student credentials)
- **Session Cookie Set**: `student_session` (stateless HMAC-signed token validating student's identity and cohort batch ID)

### Weekly Student Schedule
Displays the cohort schedule for a batch.
- **Route**: `GET /ui/batches/{batchId}/events`
- **Strict Authorization**: Access is allowed ONLY to:
  1. Signed-in administrators (valid `admin_session` cookie).
  2. The registered student assigned to that specific `batchId` (valid `student_session` cookie containing matching `batchId`).
  *All other requests will redirect to the student login (`/ui/lookup`).*

### Student logout
Clears the student session.
- **Route**: `GET /ui/lookup/logout` (Deletes `student_session` and redirects to `/ui/lookup`)
