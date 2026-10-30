#!/usr/bin/env bash
set -euo pipefail

APP_USER="${APP_USER:-ssgpharma}"
APP_ROOT="/srv/ssgpharma"
SWAP_FILE="/swapfile"

echo "Installing system packages, Node.js LTS, pnpm, PM2 and Caddy."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg ufw sqlite3 unzip
if ! command -v aws >/dev/null 2>&1; then
  # The apt "awscli" package is gone on Ubuntu 24.04; use the official v2 bundle (needed by backup.sh).
  AWSCLI_TMP="$(mktemp -d)"
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip" -o "$AWSCLI_TMP/awscliv2.zip"
  unzip -q "$AWSCLI_TMP/awscliv2.zip" -d "$AWSCLI_TMP"
  sudo "$AWSCLI_TMP/aws/install"
  rm -rf "$AWSCLI_TMP"
fi
if ! id "$APP_USER" >/dev/null 2>&1; then sudo useradd --system --create-home --home-dir "/home/$APP_USER" --shell /bin/bash "$APP_USER"; fi
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo corepack enable
sudo corepack prepare pnpm@10.27.0 --activate
sudo npm install --global pm2
sudo -u "$APP_USER" pm2 install pm2-logrotate
sudo -u "$APP_USER" pm2 set pm2-logrotate:max_size 10M
sudo -u "$APP_USER" pm2 set pm2-logrotate:retain 14
if ! command -v caddy >/dev/null 2>&1; then
  sudo install -d -m 0755 /etc/apt/keyrings
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update && sudo apt-get install -y caddy
fi

echo "Creating shared and release directories."
sudo install -d -o "$APP_USER" -g "$APP_USER" "$APP_ROOT/releases" "$APP_ROOT/shared/data" "$APP_ROOT/shared/uploads" "$APP_ROOT/shared/backups"
sudo install -d -o "$APP_USER" -g "$APP_USER" /var/log/ssgpharma
if [ ! -e "$APP_ROOT/shared/.env" ]; then sudo install -o "$APP_USER" -g "$APP_USER" -m 0600 /dev/null "$APP_ROOT/shared/.env"; fi
sudo chown "$APP_USER:$APP_USER" "$APP_ROOT/shared/.env"
sudo chmod 0600 "$APP_ROOT/shared/.env"

echo "Configuring firewall for SSH, HTTP and HTTPS only."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

if [ ! -f "$SWAP_FILE" ]; then
  echo "Creating 2 GB swap file."
  sudo fallocate -l 2G "$SWAP_FILE"
  sudo chmod 0600 "$SWAP_FILE"
  sudo mkswap "$SWAP_FILE"
fi
if ! grep -qF "$SWAP_FILE" /etc/fstab; then echo "$SWAP_FILE none swap sw 0 0" | sudo tee -a /etc/fstab >/dev/null; fi
sudo swapon --show | grep -qF "$SWAP_FILE" || sudo swapon "$SWAP_FILE"

echo "Enabling PM2 startup and Caddy."
sudo env PATH="$PATH" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" || true
sudo systemctl enable --now caddy
echo "Server setup complete. Edit /srv/ssgpharma/shared/.env and install the Caddyfile for your domain."
