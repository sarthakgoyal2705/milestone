import "server-only";
import { prisma } from "@/lib/prisma";

export async function writeAuditLog(params: {
  userId?: string | null;
  actorName: string;
  action: string;
  entityType?: string;
  entityId?: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? undefined,
      actorName: params.actorName,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
    },
  });
}
