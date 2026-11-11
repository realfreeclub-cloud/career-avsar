# API Documentation
**Indian Teacher Recruitment & Placement Platform**

This document specifies the REST API endpoints, schemas, authentication mechanisms, and rate limits.

---

## 1. Global Conventions & Standards

- **Base URL**: `https://your-domain.com/api`
- **Response Format**: Strict JSON format wrapping data in `{ ok: true, data: { ... } }` or `{ ok: false, error: { code, message, details? } }`.
- **Authentication**: Session cookie (`itr_session`) issued via `POST /api/auth/login`. Cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` on HTTPS.
- **CSRF & Browser Isolation**: `SameSite=Lax` cookies with strict Origin/Referer headers.

---

## 2. Public Endpoints

### `GET /api/health`
Probes database connectivity, container uptime, and server health.
- **Access**: Public
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "status": "healthy",
      "service": "Indian Teacher Recruitment Platform",
      "database": { "status": "connected", "latencyMs": 1 },
      "process": { "uptimeSeconds": 3600, "memoryUsageMb": 112 },
      "timestamp": "2026-11-07T16:00:00.000Z"
    }
  }
  ```

### `GET /api/public/jobs`
Searches published teaching vacancies. Respects `public_jobs` platform toggle.
- **Query Parameters**:
  - `q` (string): Text query matching title, subject, school, or location.
  - `state` / `city` (string): Geographic location filters.
  - `category` (string): PGT, TGT, PRT, Headmistress, Principal, etc.
  - `subject` (string): Teaching subject.
  - `page` (number): Default `1`.
  - `limit` (number): Default `9` (max 24).
- **Response (200)**: Paged list of published job cards.

### `GET /api/public/jobs/:id`
Retrieves full details, qualifications, and deadline of an active job opening.

---

## 3. Authentication Endpoints

### `POST /api/auth/register`
Creates a new candidate educator account. Respects `teacher_registration` platform toggle.
- **Rate Limit**: 10 requests / minute / IP
- **Request Body**:
  ```json
  {
    "fullName": "Ananya Sharma",
    "email": "ananya.sharma@example.com",
    "mobile": "+919876543210",
    "password": "Password123!"
  }
  ```

### `POST /api/auth/login`
Authenticates user and issues HTTP-only session cookie. Respects `teacher_login` and `school_login` platform toggles.
- **Rate Limit**: 20 requests / minute / IP
- **Request Body**:
  ```json
  {
    "email": "ananya.sharma@example.com",
    "password": "Password123!"
  }
  ```

### `POST /api/auth/logout`
Destroys session and clears cookie.

### `GET /api/auth/me`
Returns currently authenticated user role and identity.

---

## 4. Teacher Candidate Endpoints

### `GET /api/teacher/profile` & `PUT /api/teacher/profile`
Fetches or updates candidate dossier across Personal, Location, Education, Experience, and Preferences steps.

### `GET /api/teacher/applications`
Lists candidate application history with current workflow statuses and updates.

### `POST /api/teacher/applications`
Submits application for a published vacancy. Respects `applications` platform toggle and blocks duplicate submissions.
- **Request Body**:
  ```json
  {
    "jobId": "6aef517d9bd6706d15c15d53",
    "coverNote": "Cover statement..."
  }
  ```

### `GET /api/teacher/interviews` & `PATCH /api/teacher/interviews`
- `GET`: Returns scheduled interviews and demonstration rounds.
- `PATCH`: Confirms attendance (`{ interviewId: "...", confirmed: true }`).

### `GET /api/teacher/notifications` & `PATCH /api/teacher/notifications`
- `GET`: Returns candidate notifications feed with unread count.
- `PATCH`: Bulk action `{ action: "mark_all_read" }`.

### `PATCH /api/teacher/notifications/:id`
Toggles read status: `{ read: boolean }`.

### `GET /api/teacher/preferences` & `PATCH /api/teacher/preferences`
- `GET`: Returns candidate communication consent flags (`email`, `sms`, `whatsapp`, `inApp`, `jobAlerts`, etc.).
- `PATCH`: Updates opt-in / opt-out preferences.

---

## 5. Administrative Endpoints

### `GET /api/admin/jobs` & `POST /api/admin/jobs`
Full vacancy management (creation, listing, filtering, duplicate, extend deadline, publish/unpublish).

### `GET /api/admin/applications` & `PATCH /api/admin/applications/:id`
Application management, candidate shortlisting, rejection, and internal private notes.

### `POST /api/admin/applications/:id/interview`
Schedules an interview demonstration round and automatically triggers multi-channel notifications.

### `GET /api/admin/reports`
Aggregates operational metrics across 12 dimensions:
- `registrationsTimeline`, `stateWise`, `districtWise`, `qualificationDistribution`, `subjectDistribution`, `experienceDistribution`, `vacancyPerformance`, `applicationsByVacancy`, `applicationStatuses`, `interviewsBreakdown`, `selections`, `placements`.
- **CSV Export**: Append `format=csv&report=<category>` for RFC 4180 CSV with UTF-8 BOM.

### `GET /api/admin/settings` & `PATCH /api/admin/settings`
- `GET`: Lists all 11 platform feature toggles and categories.
- `PATCH`: Toggles individual or bulk feature switches. Changes are logged to the audit trail.

### `GET /api/admin/backup` & `POST /api/admin/backup`
- `GET`: Lists available database snapshots on server disk.
- `POST`: Generates a new point-in-time snapshot of all database collections.
