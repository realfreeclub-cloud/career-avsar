import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AuditLogModel } from "@/lib/db/models/admin/audit-log";
import { logger } from "@/lib/logger";

export async function logAdminAction(input: {
  actorUserId: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await connectToDatabase();
    await AuditLogModel.create(input);
  } catch (err) {
    logger.error({ err, action: input.action, entityType: input.entityType, entityId: input.entityId }, "Failed to write audit log");
  }
}
