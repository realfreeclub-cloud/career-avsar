import { z } from "zod";
import { ok, fail, handleApiError } from "@/lib/api/response";
import { listApprovedInstitutions } from "@/server/services/public";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid parameters", 400, parsed.error.flatten());
    }
    const items = await listApprovedInstitutions(parsed.data.limit);
    return ok({ items });
  } catch (err) {
    return handleApiError(err);
  }
}
