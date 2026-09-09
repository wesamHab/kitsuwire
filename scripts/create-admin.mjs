import { PrismaClient, UserRole } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "KitsuWire Admin";
  if (!email) throw new Error("ADMIN_EMAIL is required.");
  if (!password || password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  await prisma.user.upsert({
    where: { email },
    update: { name, role: UserRole.ADMIN, passwordHash: hashPassword(password) },
    create: { email, name, role: UserRole.ADMIN, passwordHash: hashPassword(password) },
  });
  console.log(`Admin account ready: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
