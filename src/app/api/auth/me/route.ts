import { handleApiError, ok } from "@/lib/api/response";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    return ok({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
