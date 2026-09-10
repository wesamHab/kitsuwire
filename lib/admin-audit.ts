import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type Actor = { id: string; email: string };

type AuditInput = {
  action: string;
  summary: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function writeAdminAudit(actor: Actor, input: AuditInput) {
  await db.adminAuditLog.create({
    data: {
      userId: actor.id,
      actorEmail: actor.email,
      action: input.action.slice(0, 100),
      summary: input.summary.slice(0, 500),
      entityType: input.entityType?.slice(0, 80) ?? null,
      entityId: input.entityId?.slice(0, 191) ?? null,
      metadata: input.metadata,
    },
  });
}
