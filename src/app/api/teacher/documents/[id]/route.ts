import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import { deleteTeacherDocument } from "@/server/services/teacher/documents";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const { id } = await params;
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return fail("INVALID_ID", "Invalid document id", 400);
    const deleted = await deleteTeacherDocument(auth.userId, id);
    if (!deleted) return fail("NOT_FOUND", "Document not found", 404);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
