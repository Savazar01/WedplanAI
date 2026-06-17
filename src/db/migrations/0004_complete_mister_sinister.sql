CREATE TABLE "api_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "api_key_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "kanban_column" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#6771ab' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"type" text DEFAULT 'custom' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "column_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "street" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "pincode" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "languages" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "theme_font" text DEFAULT 'Geist' NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "theme_primary" text DEFAULT '#6771ab' NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "theme_secondary" text DEFAULT '#8b93c5' NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "theme_background" text DEFAULT '#f8fafc' NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "logo_data" text;--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_wedding_id_wedding_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."wedding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanban_column" ADD CONSTRAINT "kanban_column_wedding_id_wedding_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."wedding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_column_id_kanban_column_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."kanban_column"("id") ON DELETE restrict ON UPDATE no action;