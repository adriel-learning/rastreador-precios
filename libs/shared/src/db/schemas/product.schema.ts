import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const siteEnum = pgEnum('site', [
  'mercadolibre',
  'garbarino',
  'megatone',
  'fravega',
]);

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: varchar('url', { length: 2048 }).notNull(),
  site: siteEnum('site').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
