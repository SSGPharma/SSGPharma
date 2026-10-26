#!/usr/bin/env bash
set -euo pipefail
DATABASE_URL="${DATABASE_URL:?Set DATABASE_URL to the Render SQLite file URL}"
DISK_DIR="${RENDER_DISK_DIR:-/opt/render/project/src/data}"
OUT_DIR="${OUT_DIR:-$PWD/render-export}"
DB_PATH="${DATABASE_URL#file:}"
case "$DB_PATH" in /*) ;; *) DB_PATH="$PWD/$DB_PATH" ;; esac
test -f "$DB_PATH" || { echo "SQLite database not found at $DB_PATH" >&2; exit 1; }
mkdir -p "$OUT_DIR"
TMP_DIR="$(mktemp -d "$OUT_DIR/.export.XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT
mkdir -p "$TMP_DIR/runtime"
echo "Creating consistent SQLite export."
sqlite3 "$DB_PATH" ".backup '$TMP_DIR/prod.db'"
test "$(sqlite3 "$TMP_DIR/prod.db" 'PRAGMA integrity_check;')" = "ok"
if [ -d "$DISK_DIR" ]; then
  find "$DISK_DIR" -mindepth 1 -maxdepth 1 ! -name 'prod.db' ! -name 'prod.db-*' -exec cp -a {} "$TMP_DIR/runtime/" \;
fi
tar -C "$TMP_DIR" -czf "$OUT_DIR/runtime-files.tar.gz" runtime
cp "$TMP_DIR/prod.db" "$OUT_DIR/prod.db"
(cd "$OUT_DIR" && sha256sum prod.db runtime-files.tar.gz > SHA256SUMS)
echo "Export ready at $OUT_DIR. Verify with: cd $OUT_DIR && sha256sum -c SHA256SUMS"
