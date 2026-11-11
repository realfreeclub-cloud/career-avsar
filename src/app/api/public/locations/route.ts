import { ok, handleApiError } from "@/lib/api/response";
import { getActiveLocations } from "@/server/services/locations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getActiveLocations();
    return ok({ items, total: items.length });
  } catch (err) {
    return handleApiError(err);
  }
}
