import { z } from 'zod';

export const megatoneApiResponseSchema = z.object({
  sku: z.string(),
  precios: z.object({
    web: z.object({
      lista: z.number(),
      promocional: z.number(),
      neto: z.number(),
    }),
  }),
});

export type MegatoneApiResponse = z.infer<typeof megatoneApiResponseSchema>;
