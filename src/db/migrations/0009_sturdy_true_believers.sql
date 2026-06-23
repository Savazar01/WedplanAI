CREATE TABLE "ceremony" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"location" text NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"is_food_served" boolean DEFAULT false NOT NULL,
	"dress_code" text,
	"extra_checklist" text,
	"assigned_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_rsvp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"ceremony_id" uuid NOT NULL,
	"rsvp_status" text NOT NULL,
	"guest_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_cat_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"follow_up_questions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "task_cat_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "wedding_trad_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"seed_tasks" text,
	"seed_ceremonies" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wedding_trad_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "guest" ADD COLUMN "invited_ceremonies" text DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "ceremony_id" uuid;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "assigned_user_id" text;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "category_data" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "persona" text DEFAULT 'diy' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "wedding_id" uuid;--> statement-breakpoint
ALTER TABLE "vendor" ADD COLUMN "ceremony_id" uuid;--> statement-breakpoint
ALTER TABLE "ceremony" ADD CONSTRAINT "ceremony_wedding_id_wedding_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."wedding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ceremony" ADD CONSTRAINT "ceremony_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_rsvp" ADD CONSTRAINT "guest_rsvp_guest_id_guest_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_rsvp" ADD CONSTRAINT "guest_rsvp_ceremony_id_ceremony_id_fk" FOREIGN KEY ("ceremony_id") REFERENCES "public"."ceremony"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_ceremony_id_ceremony_id_fk" FOREIGN KEY ("ceremony_id") REFERENCES "public"."ceremony"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_wedding_id_wedding_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."wedding"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor" ADD CONSTRAINT "vendor_ceremony_id_ceremony_id_fk" FOREIGN KEY ("ceremony_id") REFERENCES "public"."ceremony"("id") ON DELETE set null ON UPDATE no action;