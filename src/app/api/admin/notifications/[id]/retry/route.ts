import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { retryCommunicationLogAdmin } from "@/server/services/admin/communication";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const { id } = await params;
    if (!id) return fail("BAD_REQUEST", "Communication Log ID is required", 400);

    const success = await retryCommunicationLogAdmin(id);
    if (!success) {
      return fail("NOT_FOUND", "Communication log not found or cannot be retried", 404);
    }

    return ok({ success: true, message: "Delivery retry dispatched successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
