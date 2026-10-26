#!/usr/bin/env bash
set -euo pipefail
APP_ROOT="${APP_ROOT:-/srv/ssgpharma}"
CURRENT="$(readlink -f "$APP_ROOT/current")"
PREVIOUS="$(find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d ! -samefile "$CURRENT" -printf '%T@ %p\n' | sort -nr | head -n1 | cut -d' ' -f2-)"
test -n "$PREVIOUS" || { echo "No previous release is available." >&2; exit 1; }
echo "Rolling back from $CURRENT to $PREVIOUS."
ln -sfn "$PREVIOUS" "$APP_ROOT/current.new"
mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
pm2 startOrReload "$PREVIOUS/deploy/ecosystem.config.js" --update-env
pm2 save
curl --fail --silent --show-error --retry 10 --retry-delay 2 http://127.0.0.1:3000/api/health
echo "Rollback complete."
