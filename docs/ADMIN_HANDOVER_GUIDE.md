# Administrator Handover & Operations Guide
**Indian Teacher Recruitment & Placement Platform**

This guide provides operational instructions for platform administrators managing institutional recruitment workflows, vacancies, communications, analytics, and platform governance.

---

## 1. Accessing the Administrative Console

- **URL**: `https://your-domain.com/admin`
- **Default Superadmin**: Configured via `.env` or seeded during deployment.
- **Roles & Permissions**: Full control over vacancies, applications, interviews, placements, analytics, templates, and system settings.

---

## 2. Job Vacancy Management

Navigate to `/admin/jobs`:
- **Create Vacancy**: Click **"Create Job Vacancy"**. Fill in institutional board (CBSE, ICSE, State), category (PGT, TGT, PRT), subject, salary range in ₹, required qualifications, CTET status, and application deadline.
- **Publish / Pause**: Use the status toggle in the vacancy table or details panel. Paused vacancies remain visible to admins but are hidden from the public feed.
- **Extend Deadline**: Click the deadline pill on any vacancy card to extend the closing date.
- **Duplicate Vacancy**: Quickly clone an existing opening when hiring for multiple sections.

---

## 3. Candidate Review & Recruitment Pipeline

Navigate to `/admin/applications`:
- **Candidate Dossier**: Click any candidate card to inspect full qualifications, B.Ed/CTET credentials, previous schools, and verified documents.
- **Shortlisting**: Click **"Shortlist Candidate"**. The candidate is moved to the shortlisted pool and automatically notified via their preferred communication channels.
- **Private Internal Notes**: Add internal interview remarks or evaluation scores. **Internal notes are strictly private to administrators and never visible to candidates.**
- **Candidate Messages**: Send candidate-visible guidance directly from the application drawer.

---

## 4. Interview Demonstration Scheduling

- **Schedule Interview**: On any shortlisted application, select **"Schedule Interview"**.
- Specify round date, time slot, demonstration instructions, and Google Meet or school campus address.
- **Multi-Channel Dispatch**: An official invitation is automatically dispatched via In-App, Email, SMS (DLT), and WhatsApp Business API.
- **Attendance Tracking**: Candidates can confirm attendance via their portal (`Confirmed` badge appears in real-time).
- **Record Feedback & Selection**: Following demonstration, record 1-5 star ratings, subject mastery, pedagogical clarity, and mark candidate as **"Selected"**.

---

## 5. Placements & Institutional Onboarding

Navigate to `/admin/placements`:
- **Record Placement**: When a candidate accepts an institutional offer, create a formal placement record.
- **Confidential Compensation**: Record offered INR salary with restricted administrative access.
- **Day 1 Joining Verification**: Update joining status (`offered` → `offer_accepted` → `joined`).

---

## 6. Multi-Channel Messaging & Broadcasts

Navigate to `/admin/notifications`:
- **Direct Messaging**: Use the Composer to send custom messages or load from standard templates.
- **Broadcast Announcements**: Use **"Broadcast Announcement"** to queue alerts to all active candidates across India.
- **Delivery Audit & Tracking**: Inspect provider message IDs (`msg_in_app_...`, `msg_email_...`, `msg_sms_...`, `msg_whatsapp_...`).
- **Safe 1-Click Retry**: If a message fails due to temporary gateway timeout, click **"Retry"** to re-dispatch safely.

---

## 7. Platform Governance & Feature Toggles

Navigate to `/admin/settings`:
All feature toggles are **strictly enforced by backend logic**:
- `teacher_registration`: Toggle OFF to suspend new candidate registrations during system maintenance.
- `teacher_login`: Toggle OFF to suspend candidate portal sign-in during scheduled updates. Admin sign-in remains active.
- `public_jobs`: Toggle OFF to temporarily pause public vacancy browsing (returns 503 maintenance page).
- `applications`: Toggle OFF to freeze new application submissions across all vacancies.
- `resume_download`: Toggle OFF to temporarily restrict document downloads.
- `email_notifications` / `sms_notifications` / `whatsapp_notifications`: Platform-level kill-switches for external gateways.

---

## 8. Analytics & CSV Reporting

Navigate to `/admin/reports`:
- Filter by date range: `Last 7 Days`, `Last 30 Days`, `Last 90 Days`, `Past Year`, or `All Time`.
- **1-Click CSV Exports**: Download Excel-compatible RFC 4180 CSV files with UTF-8 BOM for:
  - Teacher registrations timeline
  - State-wise and District-wise talent distribution
  - Qualifications and Experience brackets
  - Vacancy engagement and application funnel
  - Interview rounds and placement conversion rates

---

## 9. Database Snapshots & Security

- **Snapshot Now**: Click **"Create Database Snapshot"** in `/admin/settings` or run `./deploy/scripts/backup.sh` on the server.
- Automatic daily backups are taken at 02:00 AM by the Docker backup container and retained for 30 days.
