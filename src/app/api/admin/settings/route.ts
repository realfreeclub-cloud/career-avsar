import { NextRequest } from "next/server";
import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  getAllPlatformSettings,
  updatePlatformSetting,
  updateMultipleSettings,
} from "@/server/services/admin/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const settings = await getAllPlatformSettings();
    return ok({ settings });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));

    if (body.settings && typeof body.settings === "object") {
      await updateMultipleSettings(body.settings, auth.userId);
      const settings = await getAllPlatformSettings();
      return ok({ settings, message: "Settings updated successfully" });
    }

    if (body.key && body.value !== undefined) {
      await updatePlatformSetting(body.key, body.value, auth.userId);
      const settings = await getAllPlatformSettings();
      return ok({ settings, message: `Setting ${body.key} updated successfully` });
    }

    return fail("BAD_REQUEST", "Provide 'key' and 'value', or a 'settings' dictionary", 400);
  } catch (err) {
    return handleApiError(err);
  }
}
