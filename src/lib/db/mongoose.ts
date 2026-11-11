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
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };
    if (env.MONGODB_DB_NAME) {
      opts.dbName = env.MONGODB_DB_NAME;
    }
    cached.promise = mongoose
      .connect(env.MONGODB_URI, opts)
      .then((m) => {
        logger.info({ db: env.MONGODB_DB_NAME || "atlas-default" }, "MongoDB Atlas connection established");
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        logger.error({ err: err?.message || err }, "MongoDB Atlas connection failed");
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
