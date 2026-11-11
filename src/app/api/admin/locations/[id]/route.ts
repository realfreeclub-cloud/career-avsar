import { z } from "zod";
import { ok, fail, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { updateLocationAdmin } from "@/server/services/locations";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

const updateLocationSchema = z.object({
  district: z.string().trim().min(1).max(100).optional(),
  state: z.string().trim().min(1).max(100).optional(),
  slug: z.string().trim().toLowerCase().max(100).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).max(1000).optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(500).optional(),
  headquarterCity: z.string().trim().max(100).optional(),
  majorTowns: z.array(z.string().trim().max(100)).optional(),
});

export async function PATCH(req: Request, { params }: Context) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    }

    const { id } = await params;
    if (!id) return fail("NOT_FOUND", "Location ID is required", 400);

    const body = await req.json().catch(() => ({}));
    const parsed = updateLocationSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid update parameters", 422, parsed.error.flatten());
    }

    const location = await updateLocationAdmin(id, parsed.data);
    if (!location) {
      return fail("NOT_FOUND", "Location not found", 404);
    }

    await logAdminAction({
      actorUserId: auth.userId,
      action: "location.update",
      entityType: "location",
      entityId: id,
      summary: `Updated service location: ${location.district} (isActive: ${location.isActive})`,
    });

    return ok({ location });
  } catch (err) {
    return handleApiError(err);
  }
}
