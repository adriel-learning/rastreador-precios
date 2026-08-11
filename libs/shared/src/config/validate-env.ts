import { baseEnvSchema } from './base-env.schema';

export function validateEnv(config: Record<string, unknown>) {
  const parsed = baseEnvSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment variables: ${issues}`);
  }

  return parsed.data;
}
