#!/bin/bash
set -euo pipefail
APP_DIR="${APP_DIR:-$(pwd)}"
cd "$APP_DIR"

echo "Enter new admin password:"
read -r -s NEW_PASSWORD
echo

if [ ${#NEW_PASSWORD} -lt 8 ]; then
  echo "ERROR: Password must be at least 8 characters."
  exit 1
fi

ADMIN_PASSWORD="$NEW_PASSWORD" node - <<'NODE'
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")

async function main() {
  const prisma = new PrismaClient()
  const password = process.env.ADMIN_PASSWORD
  const passwordHash = await bcrypt.hash(password, 12)
  const existing = await prisma.adminUser.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  })

  if (existing) {
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: { passwordHash },
    })
  } else {
    await prisma.adminUser.create({
      data: {
        email: "admin@medipro.local",
        name: "Admin",
        passwordHash,
        role: "admin",
      },
    })
  }

  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  process.exit(1)
})
NODE

echo "Admin password updated."
