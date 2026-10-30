#!/usr/bin/env bash
# One-shot health overview for the Lightsail box. Run as the ubuntu user: bash /srv/ssgpharma/current/deploy/status.sh
set -uo pipefail
APP_ROOT="/srv/ssgpharma"
SITE="$(sudo -u ssgpharma sed -n 's/^NEXT_PUBLIC_SITE_URL=//p' "$APP_ROOT/shared/.env" 2>/dev/null | tail -n 1)"

echo "== Release"
readlink -f "$APP_ROOT/current" || true
ls -1t "$APP_ROOT/releases" | head -5 | sed 's/^/  /'
echo "== App (PM2)"
sudo -u ssgpharma pm2 list 2>/dev/null | grep -E "ssgpharma|name" | head -3
echo "== Health"
printf "  local  /api/health: "; curl -s -m 8 -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/health
[ -n "$SITE" ] && { printf "  public %s: " "$SITE"; curl -s -m 15 -o /dev/null -w "%{http_code}\n" "$SITE/api/health"; }
echo "== Services"
for s in caddy ssgpharma-backup.timer; do printf "  %-24s %s\n" "$s" "$(systemctl is-active "$s")"; done
printf "  %-24s %s (starts the app on boot)\n" "pm2-ssgpharma" "$(systemctl is-enabled pm2-ssgpharma 2>&1)"
echo "== Backups"
systemctl list-timers ssgpharma-backup.timer --no-pager 2>/dev/null | sed -n '2p'
sudo tail -n 2 /var/log/ssgpharma/backup.log 2>/dev/null | sed 's/^/  /'
echo "== Database"
sudo -u ssgpharma sqlite3 "$APP_ROOT/shared/data/prod.db" "select 'products',count(*) from Product union all select 'molecules',count(*) from Molecule union all select 'admins',count(*) from AdminUser;" 2>&1 | sed 's/^/  /'
echo "== Resources"
free -m | awk 'NR==2{printf "  memory: %s/%s MB used\n",$3,$2}'
df -h / | awk 'NR==2{printf "  disk:   %s used of %s (%s)\n",$3,$2,$5}'
uptime | sed 's/^/  /'
