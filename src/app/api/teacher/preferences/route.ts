import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    await connectToDatabase();
    const profile = await TeacherProfileModel.findOne({ userId: auth.userId }).lean();

    const preferences = profile?.communicationPreferences || {
      email: true,
      sms: true,
      whatsapp: true,
      inApp: true,
      jobAlerts: true,
      interviewReminders: true,
      announcements: true,
    };

    return ok({ preferences });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    if (!body || typeof body !== "object") {
      return fail("BAD_REQUEST", "Invalid body payload", 400);
    }

    await connectToDatabase();
    const updateFields: Record<string, boolean> = {};

    const allowedKeys = [
      "email",
      "sms",
      "whatsapp",
      "inApp",
      "jobAlerts",
      "interviewReminders",
      "announcements",
    ] as const;

    for (const key of allowedKeys) {
      if (typeof body[key] === "boolean") {
        updateFields[`communicationPreferences.${key}`] = body[key];
      }
    }

    const updated = await TeacherProfileModel.findOneAndUpdate(
      { userId: auth.userId },
      { $set: updateFields },
      { new: true, upsert: false },
    ).lean();

    const preferences = updated?.communicationPreferences || {
      email: true,
      sms: true,
      whatsapp: true,
      inApp: true,
      jobAlerts: true,
      interviewReminders: true,
      announcements: true,
      ...body,
    };

    return ok({ preferences, message: "Communication preferences updated successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
