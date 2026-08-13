import { z } from 'zod';

export const fravegaApiResponseSchema = z.object({
  data: z.object({
    skus: z.object({
      results: z
        .object({
          pricing: z
            .object({
              listPrice: z.number(),
              salePrice: z.number(),
            })
            .array(),
        })
        .array(),
    }),
  }),
});

export type FravegaApiResponse = z.infer<typeof fravegaApiResponseSchema>;
