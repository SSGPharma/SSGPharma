# Render to Lightsail migration audit (Task 1)

Audit scope: source/configuration in the current repository plus tracked names/content history checks. The audit did not open or copy `prod.db`, `dev.db`, or any real secrets. Findings below describe the repository state before migration tasks 2–9 were implemented in this branch; Task 9 adds an optional local/S3 image-storage path.

## Render-specific code and configuration

- `render.yaml`: Render Node web service, Singapore region, starter plan, persistent disk at `/opt/render/project/src/data`, `DATABASE_URL=file:/opt/render/project/src/data/prod.db`, build and start commands.
- `scripts/render-start.sh`: legacy boot-time `prisma migrate deploy`, database directory creation, and file touch. It is now gated by `RENDER_RUNTIME_MIGRATIONS=true` and set only in the legacy Render Blueprint.
- `scripts/render-reset-db.sh`: destructive, explicitly guarded Render SQLite reset utility; only use with the confirmation token.
- `deploy/render.md`: Render persistent disk and deploy instructions; retained as legacy until service cancellation.
- Render-specific absolute path also appeared in migration documentation and deploy documentation; the Lightsail runbook now uses `/srv/ssgpharma/shared`.
- Runtime migration per app boot is not suitable for the Lightsail PM2 service; the new release activation script runs migrations before switching the current symlink.

## Filesystem reads/writes

- Prisma reads and writes the SQLite database selected by `DATABASE_URL`. Prisma relative SQLite URLs resolve relative to `prisma/schema.prisma`; use `file:./dev.db` for local development and an absolute shared file path in production.
- Admin CRUD endpoints write product, molecule, categories, contact configuration and inquiries through Prisma. Contact configuration may create its default row when absent.
- Before Task 9, admin product and molecule images were base64 data URLs stored in the SQLite image columns. No upload files were written to disk. Task 9 stores local uploads in `UPLOADS_DIR` (default `data/uploads`) or S3 keys when opted in.
- `public/` is read-only static content. It is copied into `.next/standalone/public`; no runtime upload writes should target it.
- Next build writes `.next/` outputs. ISR and Next image optimization use the Next data/image cache under `.next/cache` at runtime; the standalone release directory must be writable by the app user. With release-per-deploy, cache contents are release-local and can be regenerated after activation.
- Prisma reads schema/migrations at build/deploy. PM2 reads `/srv/ssgpharma/shared/.env`; release symlinks point at shared env/data/upload directories.
- Logs are PM2/Caddy/systemd outputs, not app data files. Backup/export tools write temporary files and managed backup/export artifacts only when invoked.

## Environment variables

| Variable | Production requirement | Use |
|---|---|---|
| `NODE_ENV` | Set to `production` on server | Next.js runtime mode and secure admin cookies |
| `PORT` | Optional; Lightsail sets 3000 | Standalone HTTP listener |
| `NEXT_PUBLIC_SITE_URL` | Required | Canonical site URL, metadata, origin validation |
| `DATABASE_URL` | Required | Prisma SQLite connection |
| `ADMIN_SESSION_SECRET` | Required; at least 32 characters | Admin session signing; `SESSION_SECRET` remains a legacy fallback |
| `SESSION_SECRET` | Legacy optional fallback | Admin session signing if new variable is absent |
| `ADMIN_PASSWORD` | Optional bootstrap only | Initial login when no AdminUser exists; not normal user auth after setup |
| `NEXT_PUBLIC_ASSET_PREFIX` | Optional, normally empty | Next.js static asset prefix |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics script configuration |
| `NEXT_DEPLOYMENT_ID` | Optional | Next deployment/build cache identifier |
| `RENDER_RUNTIME_MIGRATIONS` | Render legacy only | Enables old Render boot-time migration path |
| `STORAGE_DRIVER` | Optional, defaults `local` | Selects local disk or opt-in S3 image storage |
| `UPLOADS_DIR` | Optional, production local storage should be shared | Local image upload directory |
| `NEXT_PUBLIC_CDN_URL` | Required only for S3 | Public base URL for S3 object keys |
| `AWS_REGION`, `S3_BUCKET` | Required only for S3 | S3 client configuration; AWS SDK uses the standard credential chain/instance role |
| `S3_ENDPOINT` | Optional | S3-compatible endpoint |
| `BACKUP_BUCKET` | Required when backup job runs | S3 destination bucket |

Deployment scripts additionally accept operational variables including `APP_USER`, `APP_ROOT`, `APP_DIR`, `APP_DATA_DIR`, `APP_PORT`, `DOMAIN`, `WWW_DOMAIN`, `CERTBOT_EMAIL`, `REPO_URL`, `ENV_FILE`, `DB_PATH`, `BACKUP_DIR`, `KEEP_LOCAL_DAYS`, `DATA_DIR`, `UPLOADS_DIR`, `OUT_DIR`, `RENDER_DISK_DIR`, `CADDYFILE_PATH`, `STRICT_NGINX_CHECK`, `NGINX_SITE_PATH`, `NGINX_ENABLED_PATH`, and `APP_URL`. These are script controls rather than application runtime settings. GitHub deployment uses the Actions secrets documented in `deploy/README.md`.

## Images, caching and runtime behavior

- Product image columns: three optional references per product (`imageUrl1`–`imageUrl3`). Molecule image column: optional `imageUrl`.
- Existing values may be external HTTP(S) links or base64 data URLs. Before Task 9, admin file selection wrote base64 data URLs to the database; there was no filesystem uploads folder.
- Task 9 preserves the schema and stores a local `/api/images/<name>` path or an S3 key in the existing fields. An optional dry-run-first script migrates supported inline PNG/JPEG/WebP images. Molecule external URLs are mirrored at save time with SSRF restrictions.
- Public pages use `unstable_cache`, ISR revalidation and cache tags, with one-hour revalidation on catalog/molecule pages and explicit invalidation after admin changes. Next's `.next/cache` is writable at runtime; it is not a permanent user-data store.

## Tracked data, secrets and credentials

- Tracked database filename/history check found no tracked `prod.db` or `dev.db` path.
- Tracked filename review found `.env.example`, but no tracked real `.env`, PEM/private-key or credentials-named file. `.env.example` uses placeholders.
- Content/history scans looked for common AWS access-key, GitHub token, private-key, and database credential markers and returned file paths only; no candidate secret values were printed. This pattern scan cannot prove arbitrary high-entropy strings are safe, so rotate any credentials discovered by the account owner separately.
- Tracked junk identified: `.pnpm-store/`, root `test.svg`, and `public/test.svg`. Task 8 removes these and ignores future package stores/test assets.
- `AGENTS.md`, `CLAUDE.md`, and `CODEX_WORKLOG.md` are tracked. The brief explicitly asks before deciding to keep/remove them; they are left untouched pending the owner's choice.

## Original deploy directory review

- Existing scripts used `/var/www/app`, Nginx/Certbot and port 5050, built on the server, and put `.env` inside the checked-out release. The PM2 config did not load that env file and did not set up log rotation.
- The old deploy script used `git pull` and replaced the active tree in place, with no release retention, health rollback or one-command symlink rollback.
- The old setup installed Node 20 and Nginx instead of the requested Caddy layout, and did not configure swap, an app-specific shared data layout, or a complete bucket backup/restore process.
- README and deploy README had absolute links into a developer Desktop path.
- New Lightsail setup, Caddy, CI release activation/rollback, SQLite backup/restore, Render transfer and cutover procedures are documented in `deploy/README.md`.

## Prioritized migration risks

1. **Data loss during cutover:** freeze all writes, use SQLite `.backup`, checksum files, verify counts, and retain Render for rollback.
2. **SQLite filesystem durability:** the database and local uploads must be on Lightsail shared persistent storage, never inside a release directory.
3. **Secrets and access:** keep `.env` out of Git and restrict S3 IAM to the single backup bucket/prefix; use an instance role.
4. **Migration ordering:** deploy schema migrations before activating a new release; validate `/api/health` and roll back the release if it fails.
5. **ISR cache warm-up:** the new release has its own `.next/cache`; expect cache regeneration after deploy and ensure app user write permission.
6. **External image links:** untrusted molecule URLs can create SSRF risk; Task 9 blocks restricted addresses/redirects and bounds time/size/type.
7. **Operational restore:** rehearse a scratch restore and compare records before DNS changes; DB restore and code rollback are separate procedures.
8. **Cost and DNS timing:** lower TTL ahead of cutover, verify billing cycle, and keep Render online for about a week before cancellation.
