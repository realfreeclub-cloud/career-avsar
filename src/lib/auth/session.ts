import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { SessionModel } from "@/lib/db/models/session";
import { UserModel, type User } from "@/lib/db/models/user";
import { env } from "@/lib/env";
import { signValue, verifySignedValue } from "@/lib/auth/crypto";

export const SESSION_COOKIE = "itr_session";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, meta?: { userAgent?: string; ip?: string }) {
  await connectToDatabase();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_SECONDS * 1000);
  await SessionModel.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    userAgent: meta?.userAgent,
    ip: meta?.ip,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signValue(token, env.AUTH_SECRET), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: env.SESSION_MAX_AGE_SECONDS,
  });
  return { expiresAt };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (raw) {
    const token = verifySignedValue(raw, env.AUTH_SECRET);
    if (token) {
      try {
        await connectToDatabase();
        await SessionModel.deleteOne({ tokenHash: hashToken(token) });
      } catch {
        /* best effort */
      }
    }
  }
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export type SessionUser = Pick<User, "role" | "email" | "status"> & { id: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const token = verifySignedValue(raw, env.AUTH_SECRET);
  if (!token) return null;
  try {
    await connectToDatabase();
  } catch {
    return null;
  }
  const session = await SessionModel.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!session) return null;
  const user = await UserModel.findById(session.userId).lean();
  if (!user || user.status !== "active") return null;
  return { id: String(user._id), role: user.role, email: user.email, status: user.status };
}
