ALTER TABLE "guest" ADD COLUMN "login_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "guest" ADD CONSTRAINT "guest_login_code_unique" UNIQUE("login_code");