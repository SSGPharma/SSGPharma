# SSGPharma

## Local setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create your env file if needed:
   ```bash
   cp .env.example .env
   ```
3. Make sure these values are correct in `.env`:
   ```bash
   NODE_ENV=development
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   DATABASE_URL="file:./dev.db"
   ADMIN_SESSION_SECRET=replace-with-a-random-32-plus-character-secret
   ADMIN_PASSWORD=change-me-before-use
   ```

Important notes:

- `DATABASE_URL` must be `file:./dev.db` for local SQLite. Using `file:./prisma/dev.db` will resolve to `prisma/prisma/dev.db` because Prisma resolves relative SQLite paths from `prisma/schema.prisma`.
- `ADMIN_SESSION_SECRET` is the current env name. `SESSION_SECRET` is still accepted as a legacy fallback.
- `ADMIN_PASSWORD` is optional and only used as a bootstrap login when no `AdminUser` row exists yet.

4. Apply migrations:
   ```bash
   pnpm prisma migrate dev
   ```
5. If you want to create or reset the admin password in the database:
   ```bash
   bash deploy/reset-admin-password.sh
   ```
6. Start the app:
   ```bash
   pnpm dev
   ```

The site will be available at [http://localhost:3000](http://localhost:3000). The admin login is at `/admin`.

## Production build

```bash
pnpm build
pnpm start
```

`pnpm start` serves the standalone build on `PORT` (default `3000`). The Lightsail deployment uses PM2 on port `3000` behind Caddy.

## Deploy notes

- This project currently uses Prisma with SQLite. That is fine on a single server with persistent disk, but it is a poor fit for serverless platforms that do not provide a writable persistent filesystem.
- For AWS, use the single-instance Lightsail setup, CI release deployment, backup and cutover steps in [`deploy/README.md`](deploy/README.md).
- If you want the least-ops managed deployment without changing the database first, Render is now wired up in this repo with a Blueprint and runtime SQLite migration support.
- If you want the easiest long-term managed deployment model, move the database to Postgres first, then deploy to a platform like Vercel, Render, or Railway.

Lightsail setup, CI deploys, backups and the Render cutover runbook are in [deploy/README.md](deploy/README.md).
The retained [Render deployment guide](deploy/render.md) is legacy documentation; keep it until Render is cancelled.
The audit findings and migration risks are in [docs/lightsail-migration-audit.md](docs/lightsail-migration-audit.md).
