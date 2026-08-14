CREATE TYPE "alert_state" AS ENUM('threshold_crossed', 'notified', 'resolved');--> statement-breakpoint
CREATE TABLE "alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"price_snapshot_id" uuid NOT NULL,
	"state" "alert_state" NOT NULL,
	"lastNotifiedPrice" numeric(10,2),
	"last_notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"alert_id" uuid NOT NULL,
	"triggerPrice" numeric(10,2) NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_price_snapshot_id_price_snapshots_id_fkey" FOREIGN KEY ("price_snapshot_id") REFERENCES "price_snapshots"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_alert_id_alert_rules_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alert_rules"("id") ON DELETE CASCADE;