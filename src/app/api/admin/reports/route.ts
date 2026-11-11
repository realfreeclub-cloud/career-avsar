import { NextRequest } from "next/server";
import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { getAdminReports, generateReportCsv } from "@/server/services/admin/reports";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const report = searchParams.get("report") || "summary";
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    if (format === "csv") {
      const { filename, csv } = await generateReportCsv(report, { from, to });
      await logAdminAction({
        actorUserId: auth.userId,
        action: "report.export_csv",
        entityType: "report",
        summary: `Exported ${report} report as CSV`,
      });

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, no-store",
        },
      });
    }

    const data = await getAdminReports({ from, to });
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}
