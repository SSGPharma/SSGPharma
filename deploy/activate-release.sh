#!/usr/bin/env bash
set -euo pipefail

RELEASE_ID="${1:?Usage: activate-release.sh RELEASE_ID}"
APP_ROOT="/srv/ssgpharma"
RELEASE="$APP_ROOT/releases/$RELEASE_ID"
PREVIOUS="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"
test -d "$RELEASE"
test -f "$APP_ROOT/shared/.env"

echo "Linking shared config/data into release $RELEASE_ID."
ln -sfn "$APP_ROOT/shared/.env" "$RELEASE/.env"
ln -sfn "$APP_ROOT/shared/data" "$RELEASE/data"
ln -sfn "$APP_ROOT/shared/uploads" "$RELEASE/uploads"
echo "Applying Prisma migrations before activation."
# Prisma CLI does not find the shared .env from here, so export DATABASE_URL (quotes stripped) explicitly.
DATABASE_URL="$(sed -n 's/^[[:space:]]*DATABASE_URL=//p' "$APP_ROOT/shared/.env" | tail -n 1 | sed -e 's/[[:space:]]*#.*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'\$/\1/")"
test -n "$DATABASE_URL" || { echo "DATABASE_URL missing from $APP_ROOT/shared/.env" >&2; exit 1; }
export DATABASE_URL
pnpm --dir "$RELEASE" dlx prisma@5.22.0 migrate deploy --schema "$RELEASE/prisma/schema.prisma"
ln -sfn "$RELEASE" "$APP_ROOT/current.new"
mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
echo "Reloading PM2 and checking health."
pm2 startOrReload "$RELEASE/deploy/ecosystem.config.js" --update-env
pm2 save
if ! curl --fail --silent --show-error --retry 20 --retry-delay 2 --retry-connrefused http://127.0.0.1:3000/api/health >/dev/null; then
  echo "Health check failed; restoring previous release." >&2
  if [ -n "$PREVIOUS" ]; then ln -sfn "$PREVIOUS" "$APP_ROOT/current.new"; mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"; pm2 startOrReload "$PREVIOUS/deploy/ecosystem.config.js" --update-env; pm2 save; fi
  exit 1
fi
echo "Pruning releases older than the most recent five."
find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | tail -n +6 | cut -d' ' -f2- | while IFS= read -r old; do [ -n "$old" ] && [ "$old" != "$PREVIOUS" ] && rm -rf -- "$old"; done
echo "Release $RELEASE_ID activated successfully."
