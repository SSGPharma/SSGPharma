#!/bin/bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/app}"
REPO_URL="${REPO_URL:-}"
DOMAIN="${DOMAIN:-ssgpharma.com}"
WWW_DOMAIN="${WWW_DOMAIN:-www.ssgpharma.com}"
APP_PORT="${APP_PORT:-5050}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
DATABASE_URL="${DATABASE_URL:-file:/var/www/app/data/prod.db}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
ADMIN_SESSION_SECRET="${ADMIN_SESSION_SECRET:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Bootstrap: system setup ==="
bash "$SCRIPT_DIR/setup-lightsail.sh"

if [ -d "$APP_DIR/.git" ]; then
  echo "=== Existing app repository detected at ${APP_DIR}; running deploy update ==="
  export APP_DIR APP_PORT DOMAIN DATABASE_URL ADMIN_PASSWORD ADMIN_SESSION_SECRET
  DEPLOY_SCRIPT="$APP_DIR/deploy/deploy.sh"
  bash "$DEPLOY_SCRIPT"
else
  if [ -z "$REPO_URL" ]; then
    echo "ERROR: REPO_URL is required when ${APP_DIR} is not initialized."
    echo "Usage: REPO_URL=https://github.com/youruser/yourrepo.git CERTBOT_EMAIL=you@example.com bash deploy/bootstrap.sh"
    exit 1
  fi
  echo "=== Fresh app setup; cloning and deploying repository ==="
  APP_DIR="$APP_DIR" REPO_URL="$REPO_URL" APP_PORT="$APP_PORT" DOMAIN="$DOMAIN" DATABASE_URL="$DATABASE_URL" ADMIN_PASSWORD="$ADMIN_PASSWORD" ADMIN_SESSION_SECRET="$ADMIN_SESSION_SECRET" \
    bash "$SCRIPT_DIR/first-deploy.sh"
fi

echo "=== Bootstrap: Nginx setup ==="
DOMAIN="$DOMAIN" WWW_DOMAIN="$WWW_DOMAIN" APP_PORT="$APP_PORT" bash "$APP_DIR/deploy/setup-nginx.sh"
STRICT_NGINX_CHECK=1 bash "$APP_DIR/deploy/inspect-runtime.sh"

echo "=== Bootstrap: SSL setup ==="
if [ -z "$CERTBOT_EMAIL" ]; then
  echo "ERROR: CERTBOT_EMAIL is required for SSL setup."
  exit 1
fi
DOMAIN="$DOMAIN" WWW_DOMAIN="$WWW_DOMAIN" CERTBOT_EMAIL="$CERTBOT_EMAIL" bash "$APP_DIR/deploy/setup-ssl.sh"

echo "=== Bootstrap: health checks ==="
APP_URL="https://${DOMAIN}" APP_PORT="$APP_PORT" bash "$APP_DIR/deploy/check-health.sh"

echo "=== Bootstrap complete ==="
