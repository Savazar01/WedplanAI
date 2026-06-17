ALTER TABLE "wedding" ADD COLUMN "showcase_font" text DEFAULT 'Playfair Display' NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "showcase_primary" text DEFAULT '#c484b0' NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "showcase_secondary" text DEFAULT '#e6b7d2' NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "showcase_background" text DEFAULT '#fffafb' NOT NULL;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "showcase_hero_url" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "showcase_hero_data" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "showcase_welcome_text" text;--> statement-breakpoint
ALTER TABLE "wedding" ADD COLUMN "showcase_details" text;