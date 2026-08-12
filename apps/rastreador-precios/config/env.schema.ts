import { z } from 'zod';
import { baseEnvSchema } from '@app/shared/config';

export const envSchema = baseEnvSchema;
export type Env = z.infer<typeof envSchema>;
