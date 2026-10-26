#!/usr/bin/env bash
set -euo pipefail
BACKUP_URI="${1:?Usage: restore.sh s3://bucket/db/YYYY/MM/prod-timestamp.db.gz}"
DB="${DB_PATH:?Set DB_PATH to the absolute SQLite file path}"
UPLOADS_DIR="${UPLOADS_DIR:-/srv/ssgpharma/shared/uploads}"
APP_ROOT="${APP_ROOT:-/srv/ssgpharma}"
TMP_DIR="$(mktemp -d)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
trap 'rm -rf "$TMP_DIR"' EXIT
mkdir -p "$(dirname "$DB")" "$UPLOADS_DIR"
echo "Downloading and validating $BACKUP_URI."
aws s3 cp "$BACKUP_URI" "$TMP_DIR/prod.db.gz"
gzip -dc "$TMP_DIR/prod.db.gz" > "$TMP_DIR/prod.db"
test "$(sqlite3 "$TMP_DIR/prod.db" 'PRAGMA integrity_check;')" = "ok"
UPLOAD_URI="${BACKUP_URI/\/db\//\/uploads\/}"
UPLOAD_URI="${UPLOAD_URI/prod-/uploads-}"
if aws s3 cp "$UPLOAD_URI" "$TMP_DIR/uploads.tar.gz" 2>/dev/null; then
  tar -tzf "$TMP_DIR/uploads.tar.gz" >/dev/null
  while IFS= read -r entry; do
    [[ "$entry" != /* && "$entry" != *"../"* && "$entry" != ".." ]] || { echo "Unsafe path in uploads archive." >&2; exit 1; }
  done < <(tar -tzf "$TMP_DIR/uploads.tar.gz")
  mkdir -p "$TMP_DIR/restored-uploads"
  tar -xzf "$TMP_DIR/uploads.tar.gz" -C "$TMP_DIR/restored-uploads"
else
  rm -f "$TMP_DIR/uploads.tar.gz"
fi
echo "Stopping app before database replacement."
pm2 stop ssgpharma || true
if [ -f "$DB" ]; then cp -a "$DB" "$DB.pre-restore-$STAMP"; fi
install -m 0640 "$TMP_DIR/prod.db" "$DB.new"
mv -f "$DB.new" "$DB"
if [ -f "$TMP_DIR/uploads.tar.gz" ]; then
  if [ -d "$UPLOADS_DIR" ]; then mv "$UPLOADS_DIR" "$UPLOADS_DIR.pre-restore-$STAMP"; fi
  mv "$TMP_DIR/restored-uploads" "$UPLOADS_DIR"
fi
pm2 startOrReload "$APP_ROOT/current/deploy/ecosystem.config.js" --update-env
pm2 save
curl --fail --silent --show-error --retry 10 --retry-delay 2 http://127.0.0.1:3000/api/health
echo "Restore completed. Previous DB retained as $DB.pre-restore-$STAMP when one existed."
