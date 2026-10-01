# SchoolOS local development

Install dependencies in `front_school` and `back_school` with `npm install` if needed. Start the backend first:

```powershell
cd back_school
npx wrangler d1 migrations apply schoolos-db --local
# Create back_school/.dev.vars with a local JWT_SECRET (keep this file private).
npx wrangler dev
```

Then, in a second terminal:

```powershell
cd front_school
npm run dev -- --host localhost
```

Open **http://localhost:5173**. The frontend uses `http://localhost:8787` by default; set `VITE_API_BASE_URL` in a local `.env` only when changing the API address. Keep the hostname as `localhost` so it matches the backend CORS origin and session cookie behavior.

The frontend is connected to `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, and `GET /api/students`. Create a user in the local D1 database before signing in; the schema migration does not create default credentials.
