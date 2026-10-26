# Lightsail Deployment and Cutover

This guide describes the Lightsail release workflow for a single Ubuntu 22.04/24.04 instance. The production app runs as `ssgpharma`, PM2 listens on `127.0.0.1:3000`, and Caddy terminates HTTPS. Render files remain available as legacy references until Render is cancelled.

## 1. Create the instance and point a temporary domain

Create an Ubuntu Lightsail instance, attach a static IP, and open SSH, HTTP, and HTTPS in the Lightsail firewall. Add an A record for the temporary host to the static IP and wait for DNS propagation. Lower the production DNS TTL before the final cutover.

## 2. Set up the server

Clone the repository to a temporary working directory and run:

```bash
bash deploy/setup-server.sh
sudoedit /srv/ssgpharma/shared/.env
```

Populate the shared env file from `.env.example`; set production `DATABASE_URL=file:/srv/ssgpharma/shared/data/prod.db`, `UPLOADS_DIR=/srv/ssgpharma/shared/uploads`, `NEXT_PUBLIC_SITE_URL`, a random `ADMIN_SESSION_SECRET` of at least 32 characters, and `BACKUP_BUCKET`. Leave `STORAGE_DRIVER=local` unless S3 image storage is intentionally enabled. Never place secrets in the repository.

Install Caddy for the temporary domain and set up the app user SSH key:

```bash
DOMAIN=temporary.example.com bash deploy/install-caddy-config.sh
```

For PM2 startup and rotated logs, `setup-server.sh` installs PM2 and `pm2-logrotate`. Caddy obtains and renews HTTPS certificates automatically after public DNS resolves.

## 3. Configure GitHub Actions

The workflow builds and lints on GitHub Actions, then uploads the standalone output. Add these repository Actions secrets:

- `LIGHTSAIL_HOST`: server IP or hostname
- `LIGHTSAIL_USER`: SSH deployment user, normally `ssgpharma`
- `LIGHTSAIL_SSH_KEY`: private SSH key authorized for that user
- `LIGHTSAIL_KNOWN_HOSTS`: verified SSH host-key line(s)

Add the repository variable `NEXT_PUBLIC_SITE_URL` with the production HTTPS origin; the workflow requires it for correct canonical metadata. If S3 image storage is enabled, also define `NEXT_PUBLIC_CDN_URL` so the CI build generates the correct public image URLs and Next.js image allowlist. Keep `STORAGE_DRIVER=local` for the default local-disk behavior.

Push to `main` or run the workflow manually. Migrations run before activation. A failed `/api/health` check restores the previous release. `deploy/rollback.sh` switches to the previous retained release. The last five releases are retained.

## 4. Export Render data and import it

On the Render shell, while the app still uses its persistent disk:

```bash
DATABASE_URL=file:/opt/render/project/src/data/prod.db \
RENDER_DISK_DIR=/opt/render/project/src/data \
OUT_DIR="$PWD/render-export" bash deploy/export-from-render.sh
cd render-export && sha256sum -c SHA256SUMS
```

Download `prod.db`, `runtime-files.tar.gz`, and `SHA256SUMS` to the server using a secure transfer method. Keep site writes frozen during the final export/import. On the Lightsail host, place those files together, then:

```bash
cd /srv/ssgpharma/current
bash deploy/import-to-server.sh /path/to/render-export
DATABASE_URL=file:/opt/ssgpharma/shared/data/prod.db pnpm dlx ts-node scripts/verify-data.ts
```

Run `scripts/verify-data.ts` on the Render shell too and compare table counts and spot-check rows. The script only reads data and prints row counts plus up to five product and molecule names/slugs.

## 5. Backups and restore

`deploy/backup.sh` makes a consistent SQLite `.backup`, runs `PRAGMA integrity_check` on the copy, gzips and uploads it to `s3://$BACKUP_BUCKET/db/YYYY/MM/`; non-empty local uploads are archived under the matching `uploads/` prefix. It prunes local files older than seven days by default. Install the nightly UTC timer:

```bash
bash /srv/ssgpharma/current/deploy/install-backup-timer.sh
systemctl list-timers ssgpharma-backup.timer
tail -f /var/log/ssgpharma/backup.log
```

The bucket should have a lifecycle rule expiring objects under `db/` and `uploads/` after 30 days. Prefer the instance role. If a bucket-scoped policy is needed, replace `BUCKET_NAME`, attach it to the instance role, and grant only these operations:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:ListBucket", "s3:ListBucketMultipartUploads"], "Resource": "arn:aws:s3:::BUCKET_NAME", "Condition": { "StringLike": { "s3:prefix": ["db/*", "uploads/*"] } } },
    { "Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject", "s3:AbortMultipartUpload", "s3:ListMultipartUploadParts"], "Resource": ["arn:aws:s3:::BUCKET_NAME/db/*", "arn:aws:s3:::BUCKET_NAME/uploads/*"] }
  ]
}
```

Test a restore into a scratch path without touching production:

```bash
mkdir -p /tmp/ssg-restore
aws s3 cp s3://BUCKET/db/YYYY/MM/prod-TIMESTAMP.db.gz /tmp/ssg-restore/db.gz
gzip -dc /tmp/ssg-restore/db.gz > /tmp/ssg-restore/prod.db
sqlite3 /tmp/ssg-restore/prod.db 'PRAGMA integrity_check;'
DATABASE_URL=file:/tmp/ssg-restore/prod.db pnpm dlx ts-node scripts/verify-data.ts
```

Production restore command (stops PM2, keeps the old DB, then validates health):

```bash
DB_PATH=/srv/ssgpharma/shared/data/prod.db bash deploy/restore.sh s3://BUCKET/db/YYYY/MM/prod-TIMESTAMP.db.gz
```

## 6. DNS cutover and rollback

1. Notify the client and freeze writes on Render.
2. Run the final consistent export, transfer it, import on Lightsail, and compare row counts/spot checks.
3. Test admin login, catalog, molecule pages, contact forms, image delivery, and `/api/health` on the temporary domain.
4. Run a backup and scratch restore test.
5. Update production A records to the Lightsail static IP; monitor health, PM2 logs, and inquiries.
6. If needed, restore DNS to Render and unfreeze writes there. Keep Render available for about a week, then cancel it after checking its billing date.

The one-command release rollback is `bash /srv/ssgpharma/current/deploy/rollback.sh`. Database rollback is separate: use `deploy/restore.sh` only after selecting and verifying a backup.

## Runtime operations

- `pm2 status` and `pm2 logs ssgpharma`
- `curl -fsS http://127.0.0.1:3000/api/health`
- `bash deploy/rollback.sh`
- `bash deploy/reset-admin-password.sh` (run from an initialized release)
- S3 image storage is optional, disabled by default, and requires a CDN URL.
