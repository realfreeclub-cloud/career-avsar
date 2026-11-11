import { handleApiError, ok, fail } from "@/lib/api/response";
import { registerSchema, registerTeacher } from "@/server/services/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`register:${ip}`, { maxRequests: 10, windowSeconds: 60 });
    if (!limit.allowed) {
      return fail(
        "TOO_MANY_REQUESTS",
        `Too many registration requests from this network. Please wait ${limit.resetInSeconds} seconds.`,
        429,
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid registration data", 400, parsed.error.flatten());
    const result = await registerTeacher(parsed.data, { userAgent: req.headers.get("user-agent") ?? undefined });
    if (!result.ok) return fail(result.code, result.message, result.status);
    return ok(result.user, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
