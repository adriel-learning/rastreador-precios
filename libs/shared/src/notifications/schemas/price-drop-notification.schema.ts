import { z } from 'zod';

export const priceDropNotificationSchema = z.object({
  productName: z.string().min(1),
  price: z.number().nonnegative(),
  url: z.url(),
});

export type PriceDropNotification = z.infer<typeof priceDropNotificationSchema>;
