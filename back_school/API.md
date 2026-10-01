# SchoolOS Worker API

All responses use `{ "success": true, "data": ... }` on success. Authenticated routes require the `sos_session` HttpOnly cookie. Both `/api/...` and `/api/v1/...` route prefixes are accepted for the implemented APIs.

## Authentication

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Authenticates an active user and creates a D1-backed session. Body: `email`, `password`. |
| POST | `/api/auth/logout` | Revokes the current session and clears its cookie. |
| GET | `/api/auth/me` | Returns the verified session identity. |
| POST | `/api/auth/refresh` | Extends an active D1-backed session. |
| POST | `/api/auth/change-password` | Changes the current password. Body: `currentPassword`, `newPassword` (minimum 12 characters). |
| POST | `/api/auth/forgot-password` | Returns an explicit configuration error until an email provider is configured. |

Login failures are recorded in `login_attempts`; five failures for an email within 15 minutes result in a `429` response. Passwords are stored only as PBKDF2 hashes.

## Students

| Method | Route | Roles | Description |
| --- | --- | --- | --- |
| GET | `/api/students` | Platform owner, school admin, branch admin, teacher, accountant | Paged tenant-scoped list. Parameters: `page`, `pageSize`/`limit`, `q`/`search`. Teachers only receive assigned class/section students. |
| GET | `/api/students/:id` | Scoped staff, teacher, student | Returns a student within the caller's school scope; students only receive their own record. |
| POST | `/api/students` | Platform owner, school admin, branch admin | Creates a student. Required body: `admissionNo`, `firstName`, `lastName`. |
| PUT | `/api/students/:id` | Platform owner, school admin, branch admin | Updates supported profile, enrollment, guardian, or status fields. |
| DELETE | `/api/students/:id` | Platform owner, school admin, branch admin | Deletes a student in the caller's tenant scope. |

Student mutations create `audit_logs` entries. School and branch values are derived from the signed session, never request input.

## Dashboard and notifications

| Method | Route | Roles | Description |
| --- | --- | --- | --- |
| GET | `/api/dashboard/admin` | Platform owner, school admin, branch admin | Database aggregation for students, teachers, today's attendance, and outstanding fees. |
| GET | `/api/notifications` | Authenticated | Current user's persistent notifications. Optional `limit` (1–100). |
| PUT | `/api/notifications/:id/read` | Authenticated | Marks the caller's notification as read. |

## Operational notes

- CORS is credentialed and limited to `ALLOWED_ORIGIN`.
- Unauthorized requests return `401`; role or tenant violations return `403` or `404` without exposing cross-school data.
- Financial payment-provider confirmation and password-reset email delivery are intentionally not faked; the latter reports a configuration error until its external provider is configured.
