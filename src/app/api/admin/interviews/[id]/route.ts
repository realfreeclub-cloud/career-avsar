import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { getInterviewAdmin } from "@/server/services/admin/interviews";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const iv = await getInterviewAdmin(params.id);
    if (!iv) return fail("NOT_FOUND", "Interview round not found", 404);

    return ok(iv);
  } catch (err) {
    return handleApiError(err);
  }
}
