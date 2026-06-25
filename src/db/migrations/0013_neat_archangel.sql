ALTER TABLE "wedding" ADD COLUMN IF NOT EXISTS "is_sample" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN IF NOT EXISTS "is_archived" boolean DEFAULT false NOT NULL;
