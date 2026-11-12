import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  APP_NAME: z.string().default("Career Avsar"),
  APP_URL: z.string().url().default("https://careeravsar.in"),
  PORT: z.coerce.number().int().positive().default(3003),
  HOSTNAME: z.string().default("127.0.0.1"),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/indian_teacher_recruitment"),
  MONGODB_DB_NAME: z.string().optional(),
  AUTH_SECRET: z.string().min(16).default("dev-only-replace-with-long-random-secret"),
  AUTH_TRUST_HOST: z
    .string()
    .optional()
    .transform((v) => v === "true")
    .pipe(z.boolean())
    .default(true),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(604800),
  DEFAULT_USER_ROLE: z.string().default("candidate"),
  FILE_STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  FILE_STORAGE_LOCAL_DIR: z.string().default("./uploads"),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  NEXT_TELEMETRY_DISABLED: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  PORT: process.env.PORT,
  HOSTNAME: process.env.HOSTNAME,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  SESSION_MAX_AGE_SECONDS: process.env.SESSION_MAX_AGE_SECONDS,
  DEFAULT_USER_ROLE: process.env.DEFAULT_USER_ROLE,
  FILE_STORAGE_PROVIDER: process.env.FILE_STORAGE_PROVIDER,
  FILE_STORAGE_LOCAL_DIR: process.env.FILE_STORAGE_LOCAL_DIR,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  LOG_LEVEL: process.env.LOG_LEVEL,
  NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED,
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsed.data;
export type AppEnv = typeof env;
