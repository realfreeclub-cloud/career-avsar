import { handleApiError, ok, fail } from "@/lib/api/response";
import { loginSchema, loginUser } from "@/server/services/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`login:${ip}`, { maxRequests: 20, windowSeconds: 60 });
    if (!limit.allowed) {
      return fail(
        "TOO_MANY_REQUESTS",
        `Too many sign-in attempts. Please try again in ${limit.resetInSeconds} seconds.`,
        429,
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid login data", 400, parsed.error.flatten());
    const result = await loginUser(parsed.data, { userAgent: req.headers.get("user-agent") ?? undefined });
    if (!result.ok) return fail(result.code, result.message, result.status);
    return ok(result.user);
  } catch (err) {
    return handleApiError(err);
  }
}
