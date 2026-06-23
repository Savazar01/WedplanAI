CREATE TABLE "catering_menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"ceremony_id" uuid NOT NULL,
	"vendor_id" uuid,
	"cuisine" text,
	"guest_count" integer DEFAULT 0 NOT NULL,
	"appetizers" text,
	"main_courses" text,
	"desserts" text,
	"drinks" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "catering_menu_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "wedding_access" text DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE "catering_menu" ADD CONSTRAINT "catering_menu_wedding_id_wedding_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."wedding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_menu" ADD CONSTRAINT "catering_menu_ceremony_id_ceremony_id_fk" FOREIGN KEY ("ceremony_id") REFERENCES "public"."ceremony"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_menu" ADD CONSTRAINT "catering_menu_vendor_id_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_catering_menu_id_catering_menu_id_fk" FOREIGN KEY ("catering_menu_id") REFERENCES "public"."catering_menu"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "user" SET persona = 'diy' WHERE role = 'admin';