#!/usr/bin/env bash

set -euo pipefail

if [[ "${RENDER_RUNTIME_MIGRATIONS:-false}" == "true" ]]; then
  : "${DATABASE_URL:?DATABASE_URL is required when runtime migrations are enabled}"
  if [[ "$DATABASE_URL" == file:* ]]; then
    db_path="${DATABASE_URL#file:}"
    db_dir="$(dirname "$db_path")"
    if [[ -n "$db_dir" && "$db_dir" != "." ]]; then mkdir -p "$db_dir"; fi
    touch "$db_path"
  fi
  echo "Applying legacy Render runtime migrations."
  pnpm exec prisma migrate deploy --schema prisma/schema.prisma
else
  echo "Skipping runtime migrations; deploy migrations explicitly before startup."
fi
exec node .next/standalone/server.js
