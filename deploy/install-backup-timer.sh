#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Installing nightly SSGPharma backup timer."
sudo install -o root -g root -m 0644 "$SCRIPT_DIR/ssgpharma-backup.service" /etc/systemd/system/ssgpharma-backup.service
sudo install -o root -g root -m 0644 "$SCRIPT_DIR/ssgpharma-backup.timer" /etc/systemd/system/ssgpharma-backup.timer
sudo systemctl daemon-reload
sudo systemctl enable --now ssgpharma-backup.timer
echo "Timer installed. Inspect with systemctl list-timers ssgpharma-backup.timer."
