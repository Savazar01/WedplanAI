CREATE TABLE "chat_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"sender_name" text NOT NULL,
	"sender_email" text,
	"sender_role" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "should_change_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "partner_a_parents" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "partner_b_parents" text;--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_wedding_id_wedding_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."wedding"("id") ON DELETE cascade ON UPDATE no action;