#!/usr/bin/env bash
set -euo pipefail
# DOMAIN is one hostname or a space/comma separated list, e.g. DOMAIN="ssgpharma.com www.ssgpharma.com"
DOMAIN="${DOMAIN:?Set DOMAIN to the production hostname(s)}"
HOSTS=()
for host in ${DOMAIN//,/ }; do
  [[ "$host" =~ ^[A-Za-z0-9.-]+$ ]] || { echo "DOMAIN entries must be hostnames: $host" >&2; exit 1; }
  HOSTS+=("$host")
done
SITE_ADDRESSES="$(IFS=,; echo "${HOSTS[*]}" | sed 's/,/, /g')"
TEMPLATE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/Caddyfile"
DEST="${CADDYFILE_PATH:-/etc/caddy/Caddyfile}"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
sed "s/DOMAIN_PLACEHOLDER/$SITE_ADDRESSES/g" "$TEMPLATE" > "$TMP"
echo "Installing Caddy config for $SITE_ADDRESSES at $DEST."
sudo install -o root -g root -m 0644 "$TMP" "$DEST"
sudo caddy validate --config "$DEST" --adapter caddyfile
sudo systemctl reload caddy
