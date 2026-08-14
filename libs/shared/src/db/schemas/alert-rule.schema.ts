import { numeric, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { products } from './product.schema';
import { priceSnapshots } from './price-snapshot.schema';

export const alertStateEnum = pgEnum('alert_state', [
  'threshold_crossed',
  'notified',
  'resolved',
]);

export const alertRules = pgTable('alert_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  priceSnapshotId: uuid('price_snapshot_id')
    .notNull()
    .references(() => priceSnapshots.id, { onDelete: 'cascade' }),
  umbral: numeric('umbral', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }).notNull(),
  state: alertStateEnum('state').notNull(),
  lastNotifiedPrice: numeric('lastNotifiedPrice', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }),
  lastNotifiedAt: timestamp('last_notified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
