import { numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { alertRules } from './alert-rule.schema';

export const notificationLogs = pgTable('notification_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertId: uuid('alert_id')
    .notNull()
    .references(() => alertRules.id, { onDelete: 'cascade' }),
  triggerPrice: numeric('triggerPrice', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true })
    .defaultNow()
    .notNull(),
});