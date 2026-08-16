import { z } from 'zod';

export const telegramSendResponseSchema = z.object({
  ok: z.boolean(),
  description: z.string().optional(),
});

export type TelegramSendResponse = z.infer<typeof telegramSendResponseSchema>;
