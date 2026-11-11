import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/user";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { JobModel } from "@/lib/db/models/job";
import { ApplicationModel } from "@/lib/db/models/teacher/application";
import { InterviewModel } from "@/lib/db/models/teacher/interview";
import { PlacementModel } from "@/lib/db/models/admin/placement";
import { NotificationModel } from "@/lib/db/models/teacher/notification";
import { CommunicationLogModel } from "@/lib/db/models/admin/communication-log";
import { NotificationTemplateModel } from "@/lib/db/models/admin/notification-template";
import { SystemSettingModel } from "@/lib/db/models/admin/setting";
import { AuditLogModel } from "@/lib/db/models/admin/audit-log";
import { logAdminAction } from "@/server/services/admin/audit";

export type BackupMetadata = {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  collectionCounts: Record<string, number>;
  totalRecords: number;
};

const BACKUP_DIR = path.join(process.cwd(), "data", "backups");

async function ensureBackupDir(): Promise<void> {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch {
    // silently handle
  }
}

export async function triggerDatabaseBackupAdmin(actorUserId?: string): Promise<BackupMetadata> {
  await connectToDatabase();
  await ensureBackupDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `itr_backup_${timestamp}.json`;
  const filePath = path.join(BACKUP_DIR, filename);

  const [
    users,
    profiles,
    jobs,
    applications,
    interviews,
    placements,
    notifications,
    commLogs,
    templates,
    settings,
    auditLogs,
  ] = await Promise.all([
    UserModel.find({}).lean(),
    TeacherProfileModel.find({}).lean(),
    JobModel.find({}).lean(),
    ApplicationModel.find({}).lean(),
    InterviewModel.find({}).lean(),
    PlacementModel.find({}).lean(),
    NotificationModel.find({}).lean(),
    CommunicationLogModel.find({}).lean(),
    NotificationTemplateModel.find({}).lean(),
    SystemSettingModel.find({}).lean(),
    AuditLogModel.find({}).lean(),
  ]);

  const collectionCounts = {
    users: users.length,
    teacherProfiles: profiles.length,
    jobs: jobs.length,
    applications: applications.length,
    interviews: interviews.length,
    placements: placements.length,
    notifications: notifications.length,
    communicationLogs: commLogs.length,
    notificationTemplates: templates.length,
    systemSettings: settings.length,
    auditLogs: auditLogs.length,
  };

  const totalRecords = Object.values(collectionCounts).reduce((a, b) => a + b, 0);

  const dumpPayload = {
    version: "1.0",
    platform: "Indian Teacher Recruitment & Placement Platform",
    createdAt: new Date().toISOString(),
    collectionCounts,
    totalRecords,
    data: {
      users,
      profiles,
      jobs,
      applications,
      interviews,
      placements,
      notifications,
      commLogs,
      templates,
      settings,
      auditLogs,
    },
  };

  const jsonString = JSON.stringify(dumpPayload, null, 2);
  await fs.writeFile(filePath, jsonString, "utf-8");
  const stat = await fs.stat(filePath);

  const meta: BackupMetadata = {
    id: filename.replace(".json", ""),
    filename,
    createdAt: new Date().toISOString(),
    sizeBytes: stat.size,
    collectionCounts,
    totalRecords,
  };

  if (actorUserId) {
    await logAdminAction({
      actorUserId,
      action: "database.backup_created",
      entityType: "system",
      summary: `Created snapshot backup ${filename} containing ${totalRecords} records (${(stat.size / 1024).toFixed(1)} KB)`,
    });
  }

  return meta;
}

export async function listBackupsAdmin(): Promise<BackupMetadata[]> {
  await ensureBackupDir();
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const items: BackupMetadata[] = [];
    for (const f of jsonFiles) {
      const p = path.join(BACKUP_DIR, f);
      const stat = await fs.stat(p);
      let counts: Record<string, number> = {};
      let total = 0;

      try {
        const content = await fs.readFile(p, "utf-8");
        const parsed = JSON.parse(content);
        counts = parsed.collectionCounts || {};
        total = parsed.totalRecords || 0;
      } catch {
        // ignore parse error
      }

      items.push({
        id: f.replace(".json", ""),
        filename: f,
        createdAt: stat.mtime.toISOString(),
        sizeBytes: stat.size,
        collectionCounts: counts,
        totalRecords: total,
      });
    }

    return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}
