import { NextRequest } from "next/server";
import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  listNotificationTemplatesAdmin,
  saveNotificationTemplateAdmin,
} from "@/server/services/admin/communication";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const templates = await listNotificationTemplatesAdmin();
    return ok({ templates });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    if (!body.name?.trim() || !body.code?.trim() || !body.event?.trim()) {
      return fail("BAD_REQUEST", "Template name, code, and event are required", 400);
    }

    if (!Array.isArray(body.channels) || body.channels.length === 0) {
      return fail("BAD_REQUEST", "At least one target channel is required", 400);
    }

    const templateId = await saveNotificationTemplateAdmin({
      id: body.id,
      name: body.name.trim(),
      code: body.code.trim(),
      event: body.event.trim(),
      channels: body.channels,
      subject: body.subject?.trim(),
      inAppBody: body.inAppBody?.trim(),
      emailHtml: body.emailHtml?.trim(),
      smsText: body.smsText?.trim(),
      whatsappText: body.whatsappText?.trim(),
      availableVariables: Array.isArray(body.availableVariables) ? body.availableVariables : [],
      status: body.status || "active",
    });

    return ok({ templateId, message: "Template saved successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
