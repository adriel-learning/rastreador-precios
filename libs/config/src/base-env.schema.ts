import { z } from 'zod';

export const baseEnvSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().int().positive(),
  DATABASE_USER: z.string(),
  DATABASE_PASS: z.string(),
  DATABASE_NAME: z.string(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
