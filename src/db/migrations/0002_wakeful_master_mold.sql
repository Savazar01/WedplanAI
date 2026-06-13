ALTER TABLE "wedding" ADD COLUMN "location_name" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "street" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "country" text DEFAULT 'India' NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "pincode" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "description" text;