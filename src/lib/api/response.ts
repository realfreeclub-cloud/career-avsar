import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: { code: string; message: string; details?: unknown } };

export function ok<T>(data: T, init?: number | ResponseInit): NextResponse<ApiOk<T>> {
  const status = typeof init === "number" ? init : init?.status ?? 200;
  return NextResponse.json({ ok: true, data }, typeof init === "number" ? { status } : init);
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiErr> {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

export function handleApiError(err: unknown): NextResponse<ApiErr> {
  if (err instanceof ZodError) {
    return fail("VALIDATION_ERROR", "Invalid request data", 400, err.flatten());
  }
  if (err instanceof Error) {
    logger.error({ err }, "API error");
    const isProd = process.env.NODE_ENV === "production";
    return fail("INTERNAL_ERROR", isProd ? "Internal server error" : err.message, 500);
  }
  logger.error({ err }, "Unknown API error");
  return fail("INTERNAL_ERROR", "Internal server error", 500);
}
