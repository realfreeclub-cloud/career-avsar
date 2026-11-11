import pino from "pino";
import { env } from "@/lib/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: env.APP_NAME },
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        }
      : undefined,
});
