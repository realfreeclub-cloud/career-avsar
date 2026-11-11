import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AuditLogModel } from "@/lib/db/models/admin/audit-log";
import { SystemSettingModel } from "@/lib/db/models/admin/setting";
import { NotificationModel } from "@/lib/db/models/teacher/notification";
import type { Paged } from "@/types/admin";

export async function listAuditLogsAdmin(query: { entityType?: string; action?: string; page?: number; limit?: number }): Promise<Paged<{ id: string; action: string; entityType: string; entityId?: string; summary: string; actorUserId?: string; createdAt: string }>> {
  const page = Math.max(1, Number(query.page) || 1); const limit = Math.min(100, Math.max(1, Number(query.limit) || 30));
  const filter: Record<string, unknown> = {}; if (query.entityType) filter.entityType = query.entityType; if (query.action) filter.action = query.action;
  try { await connectToDatabase(); const [items, total] = await Promise.all([AuditLogModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), AuditLogModel.countDocuments(filter)]);
    return { items: (items as Array<Record<string, unknown>>).map((a) => ({ id: String(a._id), action: String(a.action ?? ""), entityType: String(a.entityType ?? ""), entityId: a.entityId ? String(a.entityId) : undefined, summary: String(a.summary ?? ""), actorUserId: a.actorUserId ? String(a.actorUserId) : undefined, createdAt: (a.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString() })), page: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  } catch { return { items: [], page: { page, limit, total: 0, totalPages: 1 } }; }
}

export async function getSettingsAdmin() { try { await connectToDatabase(); const items = await SystemSettingModel.find({}).sort({ key: 1 }).lean(); return (items as Array<Record<string, unknown>>).map((s) => ({ key: String(s.key), value: s.value, description: s.description ? String(s.description) : undefined })); } catch { return []; } }
export async function upsertSettingAdmin(key: string, value: unknown) { await connectToDatabase(); await SystemSettingModel.findOneAndUpdate({ key }, { $set: { key, value } }, { upsert: true }); }

export async function createAdminNotification(data: { teacherUserId: string; title: string; body: string; type?: string; href?: string }) {
  await connectToDatabase();
  const type = (["application", "interview", "profile", "system", "message"].includes(data.type || "") ? data.type : "system") as "application" | "interview" | "profile" | "system" | "message";
  const doc = await NotificationModel.create({ teacherUserId: data.teacherUserId, title: data.title, body: data.body, type, href: data.href });
  return String(doc._id);
}
