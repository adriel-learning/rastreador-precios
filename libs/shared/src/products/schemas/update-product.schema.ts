import { z } from 'zod';
import { SITE_VALUES } from '../types/site.type';

export const updateProductSchema = z.object({
  url: z.url().optional(),
  site: z.enum(SITE_VALUES).optional(),
  name: z.string().min(1).optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;