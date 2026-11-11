import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { SystemSettingModel } from "@/lib/db/models/admin/setting";
import { logAdminAction } from "@/server/services/admin/audit";

export type FeatureKey =
  | "teacher_registration"
  | "teacher_login"
  | "public_jobs"
  | "applications"
  | "resume_download"
  | "school_registration"
  | "school_login"
  | "school_dashboard"
  | "email_notifications"
  | "sms_notifications"
  | "whatsapp_notifications";

export type SettingDefinition = {
  key: FeatureKey;
  label: string;
  category: "access" | "recruitment" | "channels";
  description: string;
  defaultValue: boolean;
  sensitive?: boolean;
};

export const PLATFORM_TOGGLES: SettingDefinition[] = [
  {
    key: "teacher_registration",
    label: "Teacher Registration",
    category: "access",
    description: "Enables prospective educators to register new accounts on the portal.",
    defaultValue: true,
  },
  {
    key: "teacher_login",
    label: "Teacher Portal Login",
    category: "access",
    description: "Allows registered educators to sign in to their dashboard and profile.",
    defaultValue: true,
    sensitive: true,
  },
  {
    key: "public_jobs",
    label: "Public Job Listings",
    category: "recruitment",
    description: "Allows public visitors to browse published teaching vacancies across schools in active service districts.",
    defaultValue: true,
    sensitive: true,
  },
  {
    key: "applications",
    label: "Job Applications",
    category: "recruitment",
    description: "Allows teachers to submit new job applications to active vacancies.",
    defaultValue: true,
    sensitive: true,
  },
  {
    key: "resume_download",
    label: "Resume & Document Download",
    category: "recruitment",
    description: "Allows recruiters and administrators to download candidate resumes and credentials.",
    defaultValue: true,
  },
  {
    key: "school_registration",
    label: "School / Institution Registration",
    category: "access",
    description: "Allows affiliated schools to register self-service hiring accounts (disabled by default).",
    defaultValue: false,
  },
  {
    key: "school_login",
    label: "School Portal Login",
    category: "access",
    description: "Permits registered institutions to access their recruitment dashboard (disabled by default).",
    defaultValue: false,
  },
  {
    key: "school_dashboard",
    label: "School Dashboard Features",
    category: "access",
    description: "Enables institution-level vacancy management and candidate tracking (disabled by default).",
    defaultValue: false,
  },
  {
    key: "email_notifications",
    label: "Email Notifications Gateway",
    category: "channels",
    description: "Master switch for dispatching transactional emails to candidates and staff.",
    defaultValue: true,
  },
  {
    key: "sms_notifications",
    label: "SMS (DLT) Notifications Gateway",
    category: "channels",
    description: "Master switch for dispatching TRAI DLT-compliant SMS notifications.",
    defaultValue: true,
  },
  {
    key: "whatsapp_notifications",
    label: "WhatsApp Business API Gateway",
    category: "channels",
    description: "Master switch for dispatching WhatsApp Business API verified notifications.",
    defaultValue: true,
  },
];

// In-memory cache for ultra-fast checks (invalidated on update)
let settingsCache: Map<string, unknown> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds cache

export async function isFeatureEnabled(key: FeatureKey): Promise<boolean> {
  const def = PLATFORM_TOGGLES.find((t) => t.key === key);
  const fallback = def ? def.defaultValue : true;

  try {
    const now = Date.now();
    if (settingsCache && now - lastCacheTime < CACHE_TTL_MS) {
      if (settingsCache.has(key)) {
        return Boolean(settingsCache.get(key));
      }
    }

    await connectToDatabase();
    const doc = await SystemSettingModel.findOne({ key }).lean();
    if (!doc || doc.value === undefined || doc.value === null) {
      return fallback;
    }

    // Refresh cache
    if (!settingsCache) settingsCache = new Map();
    settingsCache.set(key, doc.value);
    lastCacheTime = now;

    return Boolean(doc.value);
  } catch {
    return fallback;
  }
}

export async function getAllPlatformSettings(): Promise<
  Array<SettingDefinition & { value: boolean; updatedAt?: string }>
> {
  await connectToDatabase();
  const dbSettings = await SystemSettingModel.find({}).lean();
  const dbMap = new Map<string, { value: unknown; updatedAt?: Date }>();

  for (const s of dbSettings) {
    dbMap.set(s.key, { value: s.value, updatedAt: s.updatedAt });
  }

  return PLATFORM_TOGGLES.map((t) => {
    const found = dbMap.get(t.key);
    return {
      ...t,
      value: found && typeof found.value === "boolean" ? found.value : t.defaultValue,
      updatedAt: found?.updatedAt?.toISOString(),
    };
  });
}

export async function updatePlatformSetting(
  key: string,
  value: unknown,
  actorUserId?: string,
): Promise<void> {
  await connectToDatabase();
  await SystemSettingModel.findOneAndUpdate(
    { key },
    { $set: { key, value, updatedByUserId: actorUserId } },
    { upsert: true, new: true },
  );

  // Invalidate cache
  if (settingsCache) {
    settingsCache.set(key, value);
    lastCacheTime = Date.now();
  }

  if (actorUserId) {
    await logAdminAction({
      actorUserId,
      action: "setting.update",
      entityType: "setting",
      summary: `Updated platform toggle ${key} to ${JSON.stringify(value)}`,
    });
  }
}

export async function updateMultipleSettings(
  updates: Record<string, unknown>,
  actorUserId?: string,
): Promise<void> {
  await connectToDatabase();
  const entries = Object.entries(updates);

  for (const [key, value] of entries) {
    await SystemSettingModel.findOneAndUpdate(
      { key },
      { $set: { key, value, updatedByUserId: actorUserId } },
      { upsert: true },
    );
  }

  // Invalidate cache
  settingsCache = null;

  if (actorUserId && entries.length > 0) {
    await logAdminAction({
      actorUserId,
      action: "settings.bulk_update",
      entityType: "setting",
      summary: `Updated ${entries.length} platform feature settings`,
    });
  }
}
