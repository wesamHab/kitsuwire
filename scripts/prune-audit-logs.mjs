import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const retentionDays = Number(process.env.AUDIT_RETENTION_DAYS ?? "365");

if (!Number.isFinite(retentionDays) || retentionDays < 90 || retentionDays > 3650) {
  console.error("AUDIT_RETENTION_DAYS must be between 90 and 3650.");
  process.exit(1);
}

const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

try {
  const result = await prisma.adminAuditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  console.log(`Deleted ${result.count} admin audit events older than ${retentionDays} days (${cutoff.toISOString()}).`);
} finally {
  await prisma.$disconnect();
}
