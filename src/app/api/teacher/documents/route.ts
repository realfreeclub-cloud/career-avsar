import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import { getTeacherProfile } from "@/server/services/teacher/profile";
import { saveTeacherDocument } from "@/server/services/teacher/documents";
import type { DocumentKind } from "@/data/teacher-options";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const profile = await getTeacherProfile(auth.userId);
    return ok({ documents: profile.documents });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const form = await req.formData().catch(() => null);
    if (!form) return fail("INVALID_FORM", "Multipart form data required", 400);
    const kind = String(form.get("kind") || "") as DocumentKind;
    const file = form.get("file");
    if (!(file instanceof File)) return fail("MISSING_FILE", "File is required", 400);
    const result = await saveTeacherDocument(auth.userId, kind, file);
    if (!result.ok) return fail(result.code, result.message, result.status);
    return ok(result.document, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
