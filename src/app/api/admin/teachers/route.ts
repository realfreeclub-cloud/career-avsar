import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { listTeachersAdmin, exportTeachersCsv } from "@/server/services/admin/teachers";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const sp = new URL(req.url).searchParams;
    const q = {
      q: sp.get("q") || undefined, state: sp.get("state") || undefined, district: sp.get("district") || undefined,
      qualification: sp.get("qualification") || undefined, subject: sp.get("subject") || undefined,
      ctet: (sp.get("ctet") as "true" | "false" | null) || undefined, uptet: (sp.get("uptet") as "true" | "false" | null) || undefined,
      verificationStatus: sp.get("verificationStatus") || undefined,
      minExp: sp.get("minExp") ? Number(sp.get("minExp")) : undefined, maxExp: sp.get("maxExp") ? Number(sp.get("maxExp")) : undefined,
      minSalary: sp.get("minSalary") ? Number(sp.get("minSalary")) : undefined, maxSalary: sp.get("maxSalary") ? Number(sp.get("maxSalary")) : undefined,
      page: Number(sp.get("page") || 1), limit: Number(sp.get("limit") || 20), sort: sp.get("sort") || undefined, order: (sp.get("order") as "asc" | "desc" | null) || undefined,
    };
    if (sp.get("format") === "csv") {
      const csv = await exportTeachersCsv(q);
      await logAdminAction({ actorUserId: auth.userId, action: "teacher.export", entityType: "teacher_profile", summary: "Exported teacher list CSV" });
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=teachers.csv", "Cache-Control": "private, no-store" } });
    }
    return ok(await listTeachersAdmin(q));
  } catch (err) { return handleApiError(err); }
}
