ALTER TABLE "api_key" ALTER COLUMN "wedding_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key" ADD COLUMN "scope" text DEFAULT 'wedding' NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key" ADD COLUMN "user_id" text;