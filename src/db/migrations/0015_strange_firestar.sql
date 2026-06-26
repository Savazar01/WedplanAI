CREATE TABLE "email_configuration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"sender_email" text NOT NULL,
	"client_id" text,
	"client_secret" text,
	"refresh_token" text,
	"api_key" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "showcase_template" text DEFAULT 'classic' NOT NULL;