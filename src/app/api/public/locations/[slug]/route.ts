import { ok, fail, handleApiError } from "@/lib/api/response";
import { getLocationBySlug } from "@/server/services/locations";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Context) {
  try {
    const { slug } = await params;
    if (!slug) return fail("NOT_FOUND", "District slug is required", 400);

    const location = await getLocationBySlug(slug);
    if (!location) {
      return fail("NOT_FOUND", `Service location '${slug}' not found or currently inactive`, 404);
    }

    return ok({ location });
  } catch (err) {
    return handleApiError(err);
  }
}
