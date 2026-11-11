import { NextRequest } from "next/server";
import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  listCommunicationLogsAdmin,
  getCommunicationStatsAdmin,
  dispatchMultiChannelMessage,
} from "@/server/services/admin/communication";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || undefined;
    const status = searchParams.get("status") || undefined;
    const event = searchParams.get("event") || undefined;
    const q = searchParams.get("q") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const [logs, stats] = await Promise.all([
      listCommunicationLogsAdmin({ channel, status, event, q, page, limit }),
      getCommunicationStatsAdmin(),
    ]);

    return ok({ logs, stats });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    if (!body.recipientUserId || !body.event) {
      return fail("BAD_REQUEST", "Recipient User ID and Event code are required", 400);
    }

    const dispatches = await dispatchMultiChannelMessage({
      recipientUserId: body.recipientUserId,
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      recipientMobile: body.recipientMobile,
      event: body.event,
      templateCode: body.templateCode,
      subject: body.subject,
      customBody: body.customBody || body.body,
      channels: body.channels,
      variables: body.variables,
      href: body.href,
    });

    return ok({ dispatches, message: "Communication dispatched successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
