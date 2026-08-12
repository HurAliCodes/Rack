import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.string().default('5000'),

  DATABASE_URL: z.string().url().refine(
    (url) => url.startsWith('postgresql://'),
    'DATABASE_URL must be a valid PostgreSQL connection string'
  ),

});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;