# Database Schema (Planned) — MongoDB/Mongoose

Part 0 creates **no business Mongoose models**. This document defines the intended collections and relationships for later phases. Refine with indexes, constraints, and migrations as features are implemented.

## Conventions
- `_id`: ObjectId (default). Use stable external IDs only if required for integrations.
- Timestamps: `createdAt`, `updatedAt` on mutable domain records.
- Soft delete where auditability matters (`deletedAt`, `deletedBy`) rather than hard delete.
- PII/sensitive documents: minimize storage, encrypt/protect at rest via infrastructure/provider controls as applicable, and restrict access via RBAC + resource scoping.
- Index all frequent query/filter/sort fields and unique identifiers (email, phone where unique, foreign keys, status, publish dates).

## Core collections (planned)

### `users`
Identity and access root.
- `email` (unique, normalized), optional `phone`
- `passwordHash` (if credential auth is used) or external identity references
- `roles: string[]` (`admin|recruiter|school|candidate`)
- `status` (`pending|active|suspended|deleted`)
- `emailVerifiedAt`, `lastLoginAt`
- profile linkage: `candidateProfileId?`, `recruiterProfileId?`, `schoolId?`
- audit: timestamps, soft-delete fields

### `schools` / `institutions`
Organization entity posting jobs (or represented by recruiters).
- name, board/type, address (state/district/city/pincode), contact info
- verification/status fields, owner/admin user refs
- timestamps

### `candidate_profiles`
Teacher/candidate data.
- `userId` (unique ref/index)
- personal basics (name, location), qualifications, subjects, grades/levels, experience
- certifications, languages, preferences, availability
- resume/document refs (`documents` collection)
- search/index helpers (subjects, location, experience) as needed

### `recruiter_profiles`
Recruiter/agency users acting for schools (if applicable).
- `userId`, organization/school associations, verification/status

### `jobs`
Job postings.
- `schoolId` and/or `postedByUserId`
- title, description, subject(s), grade/level, employment type
- location, salary range (optional/structured), requirements
- `status` (`draft|published|closed|archived`), `publishedAt`, `expiresAt`
- timestamps; text/index strategy for search in later phase

### `applications`
Candidate applications to jobs.
- `jobId`, `candidateUserId` (compound unique to prevent duplicates, unless reapply rules differ)
- `status` (e.g., `submitted|screening|shortlisted|interview|offered|rejected|withdrawn`)
- snapshot/resume ref, notes (RBAC-scoped), timeline/events
- timestamps

### `documents`
Uploaded file metadata (actual bytes in storage provider).
- owner `userId`, purpose/type (`resume|certificate|id|other`)
- storage provider/key/url (or presigned strategy), mime type, size, checksum (optional)
- verification/status, timestamps

### `audit_events` (recommended)
Security/compliance-relevant actions (logins, role changes, application status changes, exports).
- actor, action, target type/id, metadata, IP/user-agent (careful with PII), timestamp

## Relationships (high level)
- User 1—0/1 CandidateProfile; User 1—0/1 RecruiterProfile; User/School associations depend on product rules.
- School 1—N Jobs. Job 1—N Applications. Candidate(User/Profile) 1—N Applications.
- User 1—N Documents. Audit events reference actors/targets by ID.

## Future implementation notes
- Add Mongoose schemas/models under `src/lib/db/models` or `src/server/models` in the domain phase.
- Validate write payloads with Zod before persistence.
- Add migrations/seed strategy if needed; keep indexes in schema definitions and verify in staging.
