#!/usr/bin/env bash
set -euo pipefail
DOMAIN="${DOMAIN:?Set DOMAIN to the production hostname}"
[[ "$DOMAIN" =~ ^[A-Za-z0-9.-]+$ ]] || { echo "DOMAIN must be a hostname." >&2; exit 1; }
TEMPLATE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/Caddyfile"
DEST="${CADDYFILE_PATH:-/etc/caddy/Caddyfile}"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" "$TEMPLATE" > "$TMP"
echo "Installing Caddy config for $DOMAIN at $DEST."
sudo install -o root -g root -m 0644 "$TMP" "$DEST"
sudo caddy validate --config "$DEST" --adapter caddyfile
sudo systemctl reload caddy
