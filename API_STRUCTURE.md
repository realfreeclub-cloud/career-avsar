# API Structure

## Style
- **Transport:** HTTP JSON via Next.js App Router Route Handlers.
- **Base:** same origin (e.g., `/api/*`). Use versioning (`/api/v1/*`) when the first public/business API stabilizes if needed.
- **Envelope:**
  - success: `{ "ok": true, "data": <payload> }`
  - error: `{ "ok": false, "error": { "code": "...", "message": "...", "details"?: ... } }`

## Current endpoints (foundation)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Service health/environment/timestamp (no secrets). |

## Planned resource groups (future phases)
- **Auth:** register/login/logout/session/refresh/verify/reset (exact routes depend on chosen auth strategy).
- **Users/Admin:** user management, role assignment (admin-only), audit views.
- **Profiles:** candidate/recruiter profile CRUD; school/institution profile management.
- **Jobs:** list/search/get/create/update/publish/close (RBAC + ownership).
- **Applications:** apply, list (candidate/recruiter/admin scopes), status transitions, notes.
- **Documents/Uploads:** upload intent, metadata, secure access URLs (storage-provider-backed).
- **Search/Filters:** paginated job/candidate discovery endpoints with validated query params.

## Conventions
- **Validation:** Zod schemas per handler; return `400 VALIDATION_ERROR` with safe details.
- **AuthN/AuthZ:** resolve auth context server-side; return `401` unauthenticated, `403` unauthorized. Never trust client role claims.
- **Pagination:** cursor or page/limit with max limits; return pagination metadata in `data`.
- **Idempotency/races:** use unique indexes and careful status transitions for applications/jobs.
- **Rate limiting:** apply to auth and sensitive endpoints at app/proxy layer in production.
- **Logging:** log request failures with context (no secrets/PII); include correlation IDs when added.
- **Caching:** default `no-store` for user-specific data; allow explicit caching only for safe public resources.
