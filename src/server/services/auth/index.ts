import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/user";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { hashPassword, verifyPassword } from "@/lib/auth/crypto";
import { createSession, destroySession } from "@/lib/auth/session";
import { isFeatureEnabled } from "@/server/services/admin/settings";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  mobile: z.string().trim().min(8).max(20),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export { registerSchema };

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;
export { loginSchema };

export async function registerTeacher(input: RegisterInput, meta?: { userAgent?: string; ip?: string }) {
  const regEnabled = await isFeatureEnabled("teacher_registration");
  if (!regEnabled) {
    return {
      ok: false as const,
      status: 403,
      code: "FEATURE_DISABLED",
      message: "Teacher registration is currently disabled by platform administrators.",
    };
  }

  await connectToDatabase();
  const email = input.email.toLowerCase();
  const existing = await UserModel.findOne({ email }).lean();
  if (existing) return { ok: false as const, status: 409, code: "EMAIL_EXISTS", message: "An account with this email already exists" };
  const passwordHash = hashPassword(input.password);
  const user = await UserModel.create({ email, passwordHash, role: "candidate", status: "active" });
  await TeacherProfileModel.updateOne(
    { userId: user._id },
    { $setOnInsert: { userId: user._id, fullName: input.fullName, email, mobile: input.mobile, "registration.currentStep": 1 } },
    { upsert: true },
  );
  await createSession(String(user._id), meta);
  return { ok: true as const, user: { id: String(user._id), email, role: "candidate" as const } };
}

export async function loginUser(input: LoginInput, meta?: { userAgent?: string; ip?: string }) {
  await connectToDatabase();
  const email = input.email.trim().toLowerCase();
  const user = await UserModel.findOne({
    $or: [
      { email },
      { email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
    ],
  });
  if (!user || user.status !== "active" || !verifyPassword(input.password, user.passwordHash)) {
    return { ok: false as const, status: 401, code: "INVALID_CREDENTIALS", message: "Invalid email or password" };
  }

  if (user.role === "candidate") {
    const loginEnabled = await isFeatureEnabled("teacher_login");
    if (!loginEnabled) {
      return {
        ok: false as const,
        status: 403,
        code: "FEATURE_DISABLED",
        message: "Teacher portal sign-in is temporarily disabled for administrative maintenance.",
      };
    }
  } else if (user.role === "school" || user.role === "recruiter") {
    const schoolLoginEnabled = await isFeatureEnabled("school_login");
    if (!schoolLoginEnabled) {
      return {
        ok: false as const,
        status: 403,
        code: "FEATURE_DISABLED",
        message: "Institutional school portal login is currently disabled by platform administrators.",
      };
    }
  }

  user.lastLoginAt = new Date();
  await user.save();
  await createSession(String(user._id), meta);
  return { ok: true as const, user: { id: String(user._id), email: user.email, role: user.role } };
}

export async function logoutUser() {
  await destroySession();
}
