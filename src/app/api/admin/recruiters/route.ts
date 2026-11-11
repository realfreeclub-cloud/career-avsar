import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { listAllSchoolContactsAdmin } from "@/server/services/admin/schools";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const sp = new URL(req.url).searchParams;
    const q = sp.get("q") || undefined;
    const page = Number(sp.get("page") || 1);
    const limit = Number(sp.get("limit") || 20);

    const data = await listAllSchoolContactsAdmin({ q, page, limit });
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}
