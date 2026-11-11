import { handleApiError, ok } from "@/lib/api/response";
import { logoutUser } from "@/server/services/auth";

export async function POST() {
  try {
    await logoutUser();
    return ok({ signedOut: true });
  } catch (err) {
    return handleApiError(err);
  }
}
