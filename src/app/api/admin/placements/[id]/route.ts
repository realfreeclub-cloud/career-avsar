import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { getPlacementAdmin } from "@/server/services/admin/placements";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const placement = await getPlacementAdmin(params.id);
    if (!placement) return fail("NOT_FOUND", "Placement record not found", 404);

    return ok(placement);
  } catch (err) {
    return handleApiError(err);
  }
}
