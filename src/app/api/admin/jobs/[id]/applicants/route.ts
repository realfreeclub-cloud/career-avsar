import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { listJobApplicantsAdmin } from "@/server/services/admin/jobs";

export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const { id } = await ctx.params;
    const items = await listJobApplicantsAdmin(id);
    return ok({ items, total: items.length });
  } catch (err) {
    return handleApiError(err);
  }
}
