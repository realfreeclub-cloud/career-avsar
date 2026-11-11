import mongoose from "mongoose";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cached;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        dbName: env.MONGODB_DB_NAME,
        bufferCommands: false,
      })
      .then((m) => {
        logger.info({ db: env.MONGODB_DB_NAME }, "MongoDB connected");
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        logger.error({ err }, "MongoDB connection failed");
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
