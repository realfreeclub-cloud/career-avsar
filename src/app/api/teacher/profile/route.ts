import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import { getTeacherProfile, saveTeacherDraft, saveFullTeacherProfile } from "@/server/services/teacher/profile";
import { draftSchema, fullProfileSchema } from "@/lib/validation/teacher-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const profile = await getTeacherProfile(auth.userId);
    return ok(profile);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const body = await req.json().catch(() => null);
    const mode = body?.mode;
    if (mode === "draft") {
      const parsed = draftSchema.safeParse(body?.data ?? body);
      if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid draft data", 400, parsed.error.flatten());
      const profile = await saveTeacherDraft(auth.userId, parsed.data);
      return ok(profile);
    }
    if (mode === "complete") {
      const parsed = fullProfileSchema.safeParse(body?.data ?? body);
      if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid profile data", 400, parsed.error.flatten());
      const profile = await saveFullTeacherProfile(auth.userId, parsed.data, { complete: true });
      return ok(profile);
    }
    // partial full save (edit profile)
    const parsed = fullProfileSchema.safeParse(body?.data ?? body);
    if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid profile data", 400, parsed.error.flatten());
    const profile = await saveFullTeacherProfile(auth.userId, parsed.data);
    return ok(profile);
  } catch (err) {
    return handleApiError(err);
  }
}

export const PATCH = PUT;
