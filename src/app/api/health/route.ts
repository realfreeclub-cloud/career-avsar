import { ok, fail } from "@/lib/api/response";
import { env } from "@/lib/env";
import { connectToDatabase } from "@/lib/db/mongoose";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const startTime = Date.now();
    await connectToDatabase();
    const dbState = mongoose.connection.readyState;
    const dbLatencyMs = Date.now() - startTime;

    if (dbState !== 1) {
      return fail(
        "DATABASE_UNAVAILABLE",
        "Database connection is not in ready state",
        503,
        { readyState: dbState },
      );
    }

    return ok({
      status: "healthy",
      service: env.APP_NAME || "Indian Teacher Recruitment Platform",
      environment: env.NODE_ENV,
      database: {
        status: "connected",
        latencyMs: dbLatencyMs,
      },
      process: {
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return fail(
      "UNHEALTHY",
      err instanceof Error ? err.message : "Health check failed",
      503,
    );
  }
}
