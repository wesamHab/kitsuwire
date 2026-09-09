import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const retentionDays = Number(process.env.ANALYTICS_RETENTION_DAYS ?? "180");

if (!Number.isFinite(retentionDays) || retentionDays < 30 || retentionDays > 3650) {
  console.error("ANALYTICS_RETENTION_DAYS must be between 30 and 3650.");
  process.exit(1);
}

const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

try {
  const result = await prisma.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } });
  console.log(`Deleted ${result.count} analytics events older than ${retentionDays} days (${cutoff.toISOString()}).`);
} finally {
  await prisma.$disconnect();
}
