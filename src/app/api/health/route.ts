import { ok, fail } from "@/lib/api/response";
import { env } from "@/lib/env";
import { connectToDatabase } from "@/lib/db/mongoose";
import mongoose from "mongoose";
import { UserModel } from "@/lib/db/models/user";
import { LocationModel } from "@/lib/db/models/location";
import { JobModel } from "@/lib/db/models/job";

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

    const dbName = mongoose.connection.name;

    // Quick stats queries with fallback
    let usersCount = 0;
    let adminExists = false;
    let locationsCount = 0;
    let jobsCount = 0;

    try {
      usersCount = await UserModel.countDocuments();
      const admin = await UserModel.findOne({
        role: "admin",
        status: "active",
      }).select("email").lean();
      adminExists = Boolean(admin);
      locationsCount = await LocationModel.countDocuments({ isActive: true });
      jobsCount = await JobModel.countDocuments({ status: "published" });
    } catch {
      // Ignore counting failures if permissions are limited
    }

    return ok({
      status: "healthy",
      service: "Career Avsar",
      environment: env.NODE_ENV,
      database: {
        status: "connected",
        dbName,
        latencyMs: dbLatencyMs,
        usersCount,
        adminExists,
        activeLocationsCount: locationsCount,
        publishedJobsCount: jobsCount,
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
