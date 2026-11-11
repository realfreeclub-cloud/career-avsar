import { fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { exportJobApplicantsCsvAdmin } from "@/server/services/admin/jobs";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const { id } = await ctx.params;
    const { csv, jobTitle } = await exportJobApplicantsCsvAdmin(id);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "job.export_applicants",
      entityType: "job",
      entityId: id,
      summary: `Exported applicants for job: ${jobTitle}`,
    });

    const safeTitle = jobTitle.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const filename = `applicants_${safeTitle}_${Date.now()}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return fail("INTERNAL_ERROR", (err as Error).message, 500);
  }
}
