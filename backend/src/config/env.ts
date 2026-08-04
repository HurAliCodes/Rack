import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),

  PORT: z.coerce.number(),

  DATABASE_URL: z.string(),

  JWT_SECRET: z.string(),

  JWT_REFRESH_SECRET: z.string(),

  REDIS_URL: z.string(),
});

export const env = envSchema.parse(process.env);