# Contact API

TypeScript REST API for the public contact form and authenticated admin dashboard. It stores submissions in PostgreSQL with Prisma, sends a notification through SMTP when configured, and exposes a separate admin API protected by JWT session cookies and database-backed role checks.

## Setup

1. Install Node.js 20+ and PostgreSQL.
2. From this directory, run `npm install`.
3. Copy `.env.example` to `.env` or use the provided values in this workspace.
4. Set `DATABASE_URL`, `ADMIN_JWT_SECRET`, `ADMIN_API_PORT`, `ADMIN_ORIGIN`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before running the app. For profile image uploads, also set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
5. Run `npm run prisma:generate` and `npm run prisma:migrate -- --name init`.
6. Seed the admin user with `npm run db:seed`.
7. Start the public API with `npm run dev` and the admin API with `npm run dev:admin`.

For deployments, apply checked-in migrations with `npx prisma migrate deploy` from this directory before starting the API.

## Deployment

The repository includes a Render Blueprint for the public and admin APIs. Deploy the `jcc-city-altar-api` service first. For the admin phase, sync the Blueprint to add `jcc-city-altar-admin-api`; set `ADMIN_ORIGIN` to the exact Cloudflare Pages URL for the admin app before testing authentication. Both APIs use Render's assigned `PORT`. Set `DATABASE_URL` to the Supabase PostgreSQL connection string and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; the service-role key must stay in Render's server-side environment.

For the admin phase on Netlify, create a site from this repository with base directory `admin`, build command `npm run build`, and publish directory `dist`. Its checked-in `_redirects` file proxies `/api` to the separate admin API and falls back to `index.html` for client-side routes. The URL `https://jcc-city-altar-api.onrender.com` is the public API; the admin proxy must target `https://jcc-city-altar-admin-api.onrender.com`. Set `ADMIN_ORIGIN` to the exact Netlify site URL so login cookies and origin checks work. Deploy the public frontend later as a separate Netlify site with base directory `frontend`, the same build command and publish directory; its rewrite targets the public API. Keep the Render service names in both redirect files aligned with `render.yaml`.

Before deploying the API, point `backend/.env` at the Supabase PostgreSQL database, run `npx prisma migrate deploy`, and seed the initial admin with `npm run db:seed`. If you need to preserve existing contact, feedback, and admin records from another PostgreSQL database, export/import that data separately; migrations create the schema but do not copy application records. Keep `ADMIN_EMAIL` and `ADMIN_PASSWORD` available only to the one-time seed command, not the frontend. Free-tier services may sleep or have usage limits, so verify the current provider limits before relying on them for production.

The public API listens on port 3000 by default, while the admin API listens on `ADMIN_API_PORT` (default 3100). In development, the admin frontend proxies `/api` requests to `http://localhost:3100`; leave `VITE_ADMIN_API_URL` unset so browser requests remain same-origin. Set `ADMIN_ORIGIN` to the exact URL used to open the admin app.

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `CONTACT_NOTIFICATION_TO` to enable email notifications. `TRUST_PROXY_HOPS` should be set to the exact number of trusted reverse-proxy hops in production.

Profile images are stored in a private Supabase Storage bucket named `feedback-profile-images` by default. To set it up, set `SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`, then run `npm run supabase:setup` from `backend/`. This creates or updates the configured private bucket with a 10 MB limit and JPEG, PNG, and WebP content types; if the bucket already exists but is public, the command stops and asks you to make it private. Never expose the service-role key in either frontend.

New submissions store the image object path and MIME type in PostgreSQL. For an existing deployment, apply migrations with `npx prisma migrate deploy` and generate the client with `npm run prisma:generate` before starting either API. After configuring Supabase, run `npm run db:migrate-profile-images` once to move legacy image bytes from PostgreSQL into the bucket. The migration is safe to rerun; the legacy database column is retained until you separately verify and remove it in a later schema migration.

## Public endpoint

`POST /api/contacts` accepts JSON with `name`, `email`, `subject`, and `message`. Successful submissions return `201 Created`; invalid input returns `400`, rate-limited clients receive `429`, and unexpected errors return a generic `500` response. Requests are limited to five per 15 minutes per client IP.

When deployed behind a reverse proxy, set `TRUST_PROXY_HOPS` to the exact number of trusted proxy hops so Express can determine client IPs correctly. Do not set it to an unrestricted value.

Run API tests with `npm test`; the tests use a lightweight Prisma substitute and do not require a database.

## Admin API

Admin routes are protected by a JWT session cookie named `jcc_admin_session` and require the authenticated user to have the `ADMIN` role in the database. Each request must also match the configured `ADMIN_ORIGIN` to prevent cross-origin access. Seed the first administrator with the database seed command. After that, an authenticated administrator can create a one-time signup invitation from the dashboard; share the generated link directly with its intended recipient. Invitations are bound to the specified email address, expire after 24 hours, and can only be used once. Signup requires a password of at least 14 characters. Invitation tokens are stored as hashes and are never sent by email automatically.

- `POST /api/admin/auth/login` accepts `{ "email": "admin@example.com", "password": "..." }` and sets an `HttpOnly` session cookie.
- `POST /api/admin/auth/invitations` requires an admin session and accepts `{ "email": "new-admin@example.com" }`. It returns a one-time signup URL and its expiration time.
- `POST /api/admin/auth/signup` accepts `{ "token": "...", "password": "at-least-fourteen-characters" }` from a valid invitation and creates an `ADMIN` account.
- `GET /api/admin/auth/me` returns the current admin user.
- `POST /api/admin/auth/logout` clears the session.
- `GET /api/admin/contacts?page=1&limit=20&search=alex&status=PENDING` lists newest first. Search matches name or email; `limit` is capped at 100.
- `PATCH /api/admin/contacts/:id` accepts `{ "status": "PENDING" }`, `{ "status": "IN_PROGRESS" }`, or `{ "status": "RESPONDED" }`.
- `DELETE /api/admin/contacts/:id` deletes a submission and returns `204`.
- `GET /api/admin/contacts/stats` returns `totalRequests`, `pendingCount`, `inProgressCount`, and `respondedCount`.