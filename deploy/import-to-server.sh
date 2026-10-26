#!/usr/bin/env bash
set -euo pipefail
EXPORT_DIR="${1:?Usage: import-to-server.sh EXPORT_DIR}"
DB_PATH="${DB_PATH:-/srv/ssgpharma/shared/data/prod.db}"
DATA_DIR="${DATA_DIR:-/srv/ssgpharma/shared/data}"
UPLOADS_DIR="${UPLOADS_DIR:-/srv/ssgpharma/shared/uploads}"
APP_ROOT="${APP_ROOT:-/srv/ssgpharma}"
IMPORT_TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$IMPORT_TMP_DIR"' EXIT
echo "Verifying checksums from $EXPORT_DIR."
(cd "$EXPORT_DIR" && sha256sum -c SHA256SUMS)
test "$(sqlite3 "$EXPORT_DIR/prod.db" 'PRAGMA integrity_check;')" = "ok"
mkdir -p "$(dirname "$DB_PATH")" "$DATA_DIR" "$UPLOADS_DIR"
if [ -f "$DB_PATH" ]; then cp -a "$DB_PATH" "$DB_PATH.pre-import-$(date -u +%Y%m%dT%H%M%SZ)"; fi
install -m 0640 "$EXPORT_DIR/prod.db" "$DB_PATH.new"
mv -f "$DB_PATH.new" "$DB_PATH"
tar -tzf "$EXPORT_DIR/runtime-files.tar.gz" >/dev/null
while IFS= read -r entry; do
  [[ "$entry" != /* && "$entry" != *"../"* && "$entry" != ".." ]] || { echo "Unsafe path in runtime archive." >&2; exit 1; }
done < <(tar -tzf "$EXPORT_DIR/runtime-files.tar.gz")
if tar -tzf "$EXPORT_DIR/runtime-files.tar.gz" | grep -q '^runtime/'; then
  tar -xzf "$EXPORT_DIR/runtime-files.tar.gz" -C "$IMPORT_TMP_DIR"
  if [ -d "$IMPORT_TMP_DIR/runtime/uploads" ]; then cp -a "$IMPORT_TMP_DIR/runtime/uploads/." "$UPLOADS_DIR/"; fi
  find "$IMPORT_TMP_DIR/runtime" -mindepth 1 -maxdepth 1 ! -name uploads -exec cp -a {} "$DATA_DIR/" \;
fi
chown -R "$(id -u):$(id -g)" "$DATA_DIR" "$UPLOADS_DIR"
find "$DATA_DIR" "$UPLOADS_DIR" -type d -exec chmod 0750 {} +
find "$DATA_DIR" "$UPLOADS_DIR" -type f -exec chmod 0640 {} +
echo "Checking Prisma migration status."
pnpm --dir "$APP_ROOT/current" dlx prisma@5.22.0 migrate status --schema "$APP_ROOT/current/prisma/schema.prisma"
echo "Import complete. Run verify-data.ts on old and new databases before DNS cutover."
