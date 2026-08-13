import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),

  // Database
  DATABASE_URL: z.string().url().refine(
    (url) => url.startsWith('postgresql://'),
    'DATABASE_URL must be a valid PostgreSQL connection string'
  ),

  // JWT Authentication
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email Service
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  FRONTEND_URL: z.string().url(),

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;