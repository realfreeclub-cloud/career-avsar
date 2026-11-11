import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardStats } from "@/server/services/admin/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    return ok(await getAdminDashboardStats());
  } catch (err) { return handleApiError(err); }
}
