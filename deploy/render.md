# LEGACY: Render Deploy Guide

Keep this guide until the Render service is cancelled.

This app can run on Render without changing the database, but because it uses SQLite you must attach a persistent disk.

## What this repo now includes

- `render.yaml` for a Render Blueprint web service
- `scripts/render-start.sh` to:
  - create the SQLite directory if needed
  - run `prisma migrate deploy` at runtime
  - start the standalone Next server

Why runtime migrations matter:

- Render's persistent disk is available only at runtime.
- Build and pre-deploy steps run on separate compute and cannot access that disk.
- If you try to run SQLite migrations during build/predeploy, the real disk-backed database will still be missing at startup.

## Recommended Render setup

1. Push this repo to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Select this repo.
4. Render should detect [`render.yaml`](/Users/kanishkadas/Desktop/altamash-paid/medipro/render.yaml).
5. Keep the web service on a paid plan because persistent disks are only available there.
6. Before the first deploy finishes, fill in the missing env values:
   - `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` for production, or your Render URL first
   - `ADMIN_PASSWORD=<your-initial-admin-password>`
7. Deploy.

## What the Blueprint config does

- Region: `singapore`
- Build command: `pnpm install --frozen-lockfile && pnpm build:standalone`
- Start command: `pnpm start:render`
- Persistent disk mount: `/opt/render/project/src/data`
- SQLite path: `file:/opt/render/project/src/data/prod.db`

## If you prefer manual service creation instead of Blueprint

Create a **Web Service** with these values:

- Runtime: `Node`
- Build command: `pnpm install --frozen-lockfile && pnpm build:standalone`
- Start command: `pnpm start:render`
- Health check path: `/`

Attach a persistent disk:

- Mount path: `/opt/render/project/src/data`
- Size: `5 GB`

Set these environment variables:

```env
DATABASE_URL=file:/opt/render/project/src/data/prod.db
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
ADMIN_SESSION_SECRET=<random-secret>
ADMIN_PASSWORD=<your-initial-admin-password>
```

## Custom domain with GoDaddy

After the app is live on its `onrender.com` URL:

1. In Render, open your service settings and add your domain.
2. In GoDaddy DNS:
   - set `@` to an `A` record pointing to `216.24.57.1`
   - set `www` to a `CNAME` pointing to your Render `onrender.com` hostname
3. Remove any old `AAAA` records for the same hostnames if they exist.
4. Go back to Render and click verify.

## Troubleshooting

### Deploy works but app cannot write database

Check:

- the service has a persistent disk attached
- the disk mount path is exactly `/opt/render/project/src/data`
- `DATABASE_URL=file:/opt/render/project/src/data/prod.db`

### Admin login fails on a fresh deploy

Use the `ADMIN_PASSWORD` value you set in Render.  
On first successful login, the app auto-creates the initial admin row if one does not exist yet.

### You changed env vars but behavior looks stale

Use **Manual Deploy -> Deploy latest commit** after changing env vars. A plain restart is not enough when you need a fresh build/runtime with new environment values.

### Fresh reset the Render SQLite database

This deletes the SQLite database on the Render persistent disk and reapplies migrations. Run it only when you intentionally want to wipe products, molecules, categories, contacts, admin users, and inquiries.

In the Render Shell for the service:

```bash
cd /opt/render/project/src
CONFIRM_RESET_DB=reset-render-db pnpm db:reset:render
```

After it finishes:

1. Restart the service from Render so the app reconnects against the fresh database file.
2. Sign in with the `ADMIN_PASSWORD` environment variable once to bootstrap a fresh admin account.
3. Change that bootstrap password immediately from the admin settings screen.
