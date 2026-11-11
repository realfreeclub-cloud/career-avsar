export const USER_ROLES = ["admin", "recruiter", "school", "candidate"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type Permission =
  | "platform:manage"
  | "users:read"
  | "jobs:read"
  | "jobs:write"
  | "applications:read"
  | "applications:write"
  | "profile:read"
  | "profile:write";

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    "platform:manage",
    "users:read",
    "jobs:read",
    "jobs:write",
    "applications:read",
    "applications:write",
    "profile:read",
    "profile:write",
  ],
  recruiter: ["jobs:read", "jobs:write", "applications:read", "profile:read", "profile:write"],
  school: ["jobs:read", "jobs:write", "applications:read", "profile:read", "profile:write"],
  candidate: ["jobs:read", "applications:read", "applications:write", "profile:read", "profile:write"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export type AuthContext = {
  userId: string;
  role: UserRole;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const { getSessionUser } = await import("@/lib/auth/session");
  const user = await getSessionUser();
  if (!user) return null;
  return { userId: user.id, role: user.role };
}

export function requirePermission(
  ctx: AuthContext | null,
  permission: Permission,
): { ok: true } | { ok: false; status: 401 | 403; message: string } {
  if (!ctx) return { ok: false, status: 401, message: "Authentication required" };
  if (!hasPermission(ctx.role, permission)) {
    return { ok: false, status: 403, message: "Insufficient permissions" };
  }
  return { ok: true };
}

export async function requireTeacher(): Promise<
  { ok: true; userId: string } | { ok: false; status: 401 | 403; message: string }
> {
  const ctx = await getAuthContext();
  if (!ctx) return { ok: false, status: 401, message: "Authentication required" };
  if (ctx.role !== "candidate") return { ok: false, status: 403, message: "Teacher account required" };
  return { ok: true, userId: ctx.userId };
}

export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; status: 401 | 403; message: string }
> {
  const ctx = await getAuthContext();
  if (!ctx) return { ok: false, status: 401, message: "Authentication required" };
  if (ctx.role !== "admin") return { ok: false, status: 403, message: "Admin access required" };
  return { ok: true, userId: ctx.userId };
}


