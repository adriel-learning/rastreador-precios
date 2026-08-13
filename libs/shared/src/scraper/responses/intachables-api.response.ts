import { z } from 'zod';

export const intachablesApiResponseSchema = z.object({
  finalPrice: z.coerce.number(),
});

export type IntachablesApiResponse = z.infer<
  typeof intachablesApiResponseSchema
>;
