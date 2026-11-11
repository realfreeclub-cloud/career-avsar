import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { listSchoolsAdmin, createSchoolAdmin } from "@/server/services/admin/schools";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const sp = new URL(req.url).searchParams;
    return ok(
      await listSchoolsAdmin({
        q: sp.get("q") || undefined,
        status: sp.get("status") || undefined,
        verificationStatus: sp.get("verificationStatus") || undefined,
        district: sp.get("district") || undefined,
        state: sp.get("state") || undefined,
        page: Number(sp.get("page") || 1),
        limit: Number(sp.get("limit") || 20),
      }),
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const body = await req.json().catch(() => ({}));
    if (!body?.name || typeof body.name !== "string" || !body.name.trim()) {
      return fail("VALIDATION_ERROR", "Official school / institution name is required", 422);
    }
    const id = await createSchoolAdmin(body, auth.userId);
    return ok({ id }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
