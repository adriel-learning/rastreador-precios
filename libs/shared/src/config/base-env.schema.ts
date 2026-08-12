import { z } from 'zod';

export const baseEnvSchema = z.object({
  PORT: z.coerce.number().int().positive(),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().int().positive(),

  MEGATONE_API_TOKEN: z.string(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
