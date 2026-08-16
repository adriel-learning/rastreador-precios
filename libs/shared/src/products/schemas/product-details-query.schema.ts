import { z } from 'zod';

export const productDetailsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).default(200),
});

export type ProductDetailsQuery = z.infer<typeof productDetailsQuerySchema>;
