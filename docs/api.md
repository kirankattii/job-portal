## Job App API Reference

Base URL: `/api`

### Auth

- POST `/auth/register`
  - Body: { email: string, name: string }
  - Public. Sends OTP.

- POST `/auth/verify-otp`
  - Body: { email: string, otp: string, password? : string }
  - Public. Verifies OTP, returns token and user.

- POST `/auth/login`
  - Body: { email: string, password: string }
  - Public. Returns token and user.

- POST `/auth/resend-otp`
  - Body: { email: string }
  - Public.

- GET `/auth/me`
  - Auth: Bearer token
  - Returns current user profile.

- POST `/auth/logout`
  - Auth: Bearer token
  - Client-side token invalidation semantics.

### Users

All user endpoints are mounted at `/users`.

- GET `/users/profile`
  - Auth: Bearer token
  - Returns authenticated user.

- PUT `/users/profile`
  - Auth: Bearer token
  - Body: Partial user fields (email validated as unique; restricted fields ignored)
  - Updates profile, returns updated user.

- GET `/users/applications`
  - Auth: Bearer token; Roles: user
  - Returns user's applications.

- POST `/users/applications/:jobId`
  - Auth: Bearer token; Roles: user
  - Form-data: resume (file)
  - Applies to job.

- GET `/users/saved-jobs`
  - Auth: Bearer token; Roles: user
  - Returns saved jobs.

- POST `/users/saved-jobs/:jobId`
  - Auth: Bearer token; Roles: user
  - Saves job.

- DELETE `/users/saved-jobs/:jobId`
  - Auth: Bearer token; Roles: user
  - Removes saved job.

- POST `/users/upload-resume`
  - Auth: Bearer token; Roles: user
  - Form-data: resume (file)
  - Uploads resume, parses, and autofills profile.

### Jobs

All job endpoints are mounted at `/jobs`.

- GET `/jobs/`
  - Public. Returns paginated jobs.

- GET `/jobs/search`
  - Public. Query parameters for search.

- GET `/jobs/:jobId`
  - Public. Returns job details.

- GET `/jobs/:jobId/applications`
  - Auth: Bearer token; Roles: recruiter, admin
  - Placeholder response in code.

- POST `/jobs/:jobId/apply`
  - Auth: Bearer token; Roles: user
  - Form-data: resume (file)
  - Applies to job.

- POST `/jobs/:jobId/save`
  - Auth: Bearer token; Roles: user
  - Saves job.

- DELETE `/jobs/:jobId/save`
  - Auth: Bearer token; Roles: user
  - Removes saved job.

- GET `/jobs/categories/list`
  - Public. Returns categories.

- GET `/jobs/locations/list`
  - Public. Returns locations.

- GET `/jobs/skills/popular`
  - Public. Returns popular skills.

### Recruiter

All recruiter endpoints require authentication and role recruiter or admin and are mounted at `/recruiter`.

- GET `/recruiter/dashboard`
  - Returns recruiter dashboard data.

- GET `/recruiter/jobs`
  - Lists recruiter's jobs.

- POST `/recruiter/jobs`
  - Creates a job.

- PUT `/recruiter/jobs/:jobId`
  - Updates a job.

- DELETE `/recruiter/jobs/:jobId`
  - Deletes a job.

- GET `/recruiter/job/:jobId/applicants`
  - Middleware: ensureJobOwnerOrAdmin
  - Returns applicants with match score.

- PUT `/recruiter/applications/:applicationId/status`
  - Updates application status.

- GET `/recruiter/candidates`
  - Searches candidates.

- GET `/recruiter/candidates/:candidateId`
  - Returns candidate profile.

### Admin

All admin endpoints require authentication and role admin and are mounted at `/admin`.

- GET `/admin/dashboard`
  - Placeholder response.

- GET `/admin/users`
  - Query: page, limit, role, isActive, search
  - Returns paginated users.

- GET `/admin/users/:userId`
  - Returns user details and statistics.

- PUT `/admin/users/:userId/status`
  - Body: { isActive: boolean, reason?: string }
  - Activates/deactivates user.

- PUT `/admin/users/:userId/role`
  - Body: { role: 'user' | 'recruiter' | 'admin' }
  - Updates user role.

- DELETE `/admin/users/:userId`
  - Body: { reason?: string }
  - Deletes user and related data (non-admin users).

- GET `/admin/recruiters`
  - Query: page, limit, verified, search, sortBy, sortOrder
  - Lists recruiters with stats.

- PUT `/admin/recruiters/:recruiterId/verify`
  - Body: { verified: boolean, reason?: string, notes?: string }
  - Verifies/unverifies recruiter.

- GET `/admin/jobs`
  - Query: page, limit, status, search, location, recruiterId, sortBy, sortOrder
  - Lists jobs with application counts.

- PUT `/admin/jobs/:jobId/status`
  - Body: { status: 'open' | 'closed', reason?: string }
  - Updates job status.

- GET `/admin/analytics`
  - Query: period ('7d'|'30d'|'90d'|'1y')
  - Returns system analytics.

- GET `/admin/reports`
  - Query: type ('summary'|'users'|'recruiters'|'jobs'|'applications'|'performance'), format, startDate, endDate, recruiterId, jobId
  - Returns report data.

### Uploads

Mounted at `/uploads`.

- POST `/uploads/avatar`
  - Auth: Bearer token; Roles: user
  - Form-data: avatar (file)
  - Uploads avatar to Cloudinary; returns URLs.

- POST `/uploads/resume`
  - Auth: Bearer token; Roles: user
  - Form-data: resume (file)
  - Uploads resume as raw; persists `resumeUrl` on user.

### AI / Matching

Mounted at `/ai`.

- POST `/ai/match-job/:jobId`
  - Auth: Bearer token; Roles: recruiter, admin
  - Computes matches for a job across users.

### AMP Email Webhooks

Mounted at `/email`.

- POST `/email/amp-profile-update`
  - Public endpoint intended for AMP email interactions.

### Shared Conventions

- Authentication: JWT via `Authorization: Bearer <token>` unless noted Public.
- Success response envelope typically `{ success: boolean, data?: any, message?: string }`.
- Errors respond with `{ success: false, message, error? }` and appropriate HTTP status codes.
- File uploads use multipart/form-data with field names noted above.

### Service Health

- GET `/api/docs`
  - Returns simple API info and base endpoints.
