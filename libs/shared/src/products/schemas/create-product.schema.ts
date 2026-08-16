import { z } from 'zod';
import { SITE_VALUES } from '../types/site.type';

export const createProductSchema = z.object({
  url: z.url(),
  site: z.enum(SITE_VALUES),
  name: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
