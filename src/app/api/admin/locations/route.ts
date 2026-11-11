import { z } from "zod";
import { ok, fail, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { getAllLocationsAdmin, createLocationAdmin } from "@/server/services/locations";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

const createLocationSchema = z.object({
  country: z.string().trim().max(100).optional().default("India"),
  state: z.string().trim().min(1, "State is required").max(100).default("Uttar Pradesh"),
  district: z.string().trim().min(1, "District name is required").max(100),
  slug: z.string().trim().toLowerCase().max(100).optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  displayOrder: z.coerce.number().int().min(0).max(1000).default(0),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(500).optional(),
  headquarterCity: z.string().trim().max(100).optional(),
  majorTowns: z.array(z.string().trim().max(100)).optional(),
});

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    }

    const items = await getAllLocationsAdmin();
    return ok({ items, total: items.length });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createLocationSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid location parameters", 422, parsed.error.flatten());
    }

    const location = await createLocationAdmin(parsed.data);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "location.create",
      entityType: "location",
      entityId: location.id,
      summary: `Added service location: ${location.district}, ${location.state}`,
    });

    return ok({ location }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
