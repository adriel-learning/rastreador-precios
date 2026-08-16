import { z } from 'zod';
import { SITE_VALUES } from '../types/site.type';

export const createProductSchema = z.object({
  url: z.url(),
  site: z.enum(SITE_VALUES),
  name: z.string().min(1),
  imageUrl: z.url().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
