# SchoolOS backend

## Local authentication setup

The `users` table is backed by local D1. Login looks up an active user by email and verifies the password against the stored PBKDF2 hash (`pbkdf2$100000$...`). A `platform_owner` account is the super-admin role; it has no school or branch scope.

From this directory, prepare the local database and start the Worker:

```powershell
# Set JWT_SECRET in .dev.vars (this file is ignored by git).
npm run seed:demo
npx wrangler dev
```

`npm run seed:demo` inserts the role demo accounts into local D1 and is safe to rerun. For a separate non-demo owner, use this interactive seed command before running the demo seed:

```powershell
npm --prefix back_school run seed:admin
```

You can also run `node back_school/scripts/seed-platform-owner.mjs` from the workspace root.

Enter the admin email and name when prompted. The script generates a random password, hashes it using the same PBKDF2 format as the Worker, and inserts a `platform_owner` in the **local** D1 database. It refuses to add another platform owner. Save the one-time password printed at the end, then sign in at `http://localhost:5173/login` with that email and password.

The script always passes Wrangler's `--local` flag and does not modify the authentication endpoints. It does not create production users; provision production administrators through a separately controlled deployment process.
# Authentication lifetime

The Worker issues a 15-minute access token and a rotating 7-day refresh token.
Each D1 session has a non-renewable 30-day absolute lifetime. Refreshing rotates
the session identifier and preserves that original absolute deadline.

Set `JWT_SECRET` with `wrangler secret put JWT_SECRET`; do not commit it. In
production, serve the Worker over HTTPS so auth cookies are marked `Secure`.
