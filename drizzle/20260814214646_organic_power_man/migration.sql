ALTER TABLE "products" RENAME COLUMN "highestPrice" TO "highest_price";--> statement-breakpoint
ALTER TABLE "alert_rules" RENAME COLUMN "lastNotifiedPrice" TO "last_notified_price";--> statement-breakpoint
ALTER TABLE "notification_logs" RENAME COLUMN "triggerPrice" TO "trigger_price";