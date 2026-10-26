#!/usr/bin/env bash
set -euo pipefail
DB="${DB_PATH:?Set DB_PATH to the absolute SQLite file path}"
BUCKET="${BACKUP_BUCKET:?Set BACKUP_BUCKET to the S3 bucket name}"
UPLOADS_DIR="${UPLOADS_DIR:-/srv/ssgpharma/shared/uploads}"
BACKUP_DIR="${BACKUP_DIR:-/srv/ssgpharma/shared/backups}"
KEEP_LOCAL_DAYS="${KEEP_LOCAL_DAYS:-7}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
MONTH_PATH="$(date -u +%Y/%m)"
mkdir -p "$BACKUP_DIR"
TMP_DIR="$(mktemp -d "$BACKUP_DIR/.backup-$STAMP.XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT
echo "Creating consistent SQLite backup from $DB."
sqlite3 "$DB" ".backup '$TMP_DIR/prod.db'"
CHECK="$(sqlite3 -batch "$TMP_DIR/prod.db" 'PRAGMA integrity_check;')"
test "$CHECK" = "ok" || { echo "Backup integrity check failed: $CHECK" >&2; exit 1; }
gzip -n "$TMP_DIR/prod.db"
aws s3 cp "$TMP_DIR/prod.db.gz" "s3://$BUCKET/db/$MONTH_PATH/prod-$STAMP.db.gz" --sse AES256
if [ -d "$UPLOADS_DIR" ] && [ -n "$(find "$UPLOADS_DIR" -type f -print -quit)" ]; then
  tar -C "$UPLOADS_DIR" -czf "$TMP_DIR/uploads-$STAMP.tar.gz" .
  aws s3 cp "$TMP_DIR/uploads-$STAMP.tar.gz" "s3://$BUCKET/uploads/$MONTH_PATH/uploads-$STAMP.tar.gz" --sse AES256
fi
mkdir -p "$BACKUP_DIR/db"
cp "$TMP_DIR/prod.db.gz" "$BACKUP_DIR/db/prod-$STAMP.db.gz"
find "$BACKUP_DIR" -type f -mtime "+$KEEP_LOCAL_DAYS" -delete
echo "Backup complete: s3://$BUCKET/db/$MONTH_PATH/prod-$STAMP.db.gz"
