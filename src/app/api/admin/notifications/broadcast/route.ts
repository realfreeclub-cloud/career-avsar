import { NextRequest } from "next/server";
import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { sendBulkAnnouncementAdmin } from "@/server/services/admin/communication";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    if (!body.title?.trim() || !body.body?.trim()) {
      return fail("BAD_REQUEST", "Announcement title and body are required", 400);
    }

    if (!Array.isArray(body.channels) || body.channels.length === 0) {
      return fail("BAD_REQUEST", "At least one communication channel must be selected", 400);
    }

    const result = await sendBulkAnnouncementAdmin({
      title: body.title.trim(),
      body: body.body.trim(),
      channels: body.channels,
      targetRole: body.targetRole || "candidate",
    });

    return ok({
      ...result,
      message: `Announcement broadcast queued to ${result.dispatchedCount} active educators`,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
