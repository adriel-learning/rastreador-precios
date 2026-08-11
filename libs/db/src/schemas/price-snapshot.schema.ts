import { numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { products } from './product.schema';

export const priceSnapshots = pgTable('price_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  price: numeric('price', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
