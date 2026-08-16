import {
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const siteEnum = pgEnum('site', [
  'mercadolibre',
  'garbarino',
  'megatone',
  'fravega',
  'intachables',
]);

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: varchar('url', { length: 2048 }).notNull(),
  site: siteEnum('site').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  imageUrl: varchar('image_url', { length: 2048 }),
  highestPrice: numeric('highest_price', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
