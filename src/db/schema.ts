import { pgTable, text, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";

// Better Auth tables (text IDs as required by default setup)
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user").notNull(), // 'admin' or 'user'
  street: text("street"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  pincode: text("pincode"),
  languages: text("languages"),
  persona: text("persona").default("diy").notNull(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  weddingId: uuid("wedding_id").references((): any => weddings.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull(),
  accountId: text("account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at"),
  password: text("password"), // Hash stored for Credentials Provider
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Better Auth Aliases for Drizzle Adapter compatibility
export const user = users;
export const session = sessions;
export const account = accounts;
export const verification = verifications;

// Wedding Business Tables (using Random UUIDs as required)
export const weddings = pgTable("wedding", {
  id: uuid("id").defaultRandom().primaryKey(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userId: text("user_id").notNull().references((): any => users.id, { onDelete: "cascade" }),
  partnerA: text("partner_a").notNull(),
  partnerB: text("partner_b").notNull(),
  tradition: text("tradition").notNull(),
  weddingDate: timestamp("wedding_date").notNull(),
  budget: integer("budget").default(0).notNull(),
  guestCount: integer("guest_count").default(0).notNull(),
  location: text("location").notNull(),
  locationName: text("location_name"),
  street: text("street"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("India").notNull(),
  pincode: text("pincode"),
  description: text("description"),
  themeFont: text("theme_font").default("Geist").notNull(),
  themePrimary: text("theme_primary").default("#6771ab").notNull(),
  themeSecondary: text("theme_secondary").default("#8b93c5").notNull(),
  themeBackground: text("theme_background").default("#f8fafc").notNull(),
  logoUrl: text("logo_url"),
  logoData: text("logo_data"),
  showcaseFont: text("showcase_font").default("Playfair Display").notNull(),
  showcaseTitleFont: text("showcase_title_font").default("Playfair Display").notNull(),
  showcasePrimary: text("showcase_primary").default("#c484b0").notNull(),
  showcaseSecondary: text("showcase_secondary").default("#e6b7d2").notNull(),
  showcaseBackground: text("showcase_background").default("#fffafb").notNull(),
  showcaseHeroUrl: text("showcase_hero_url"),
  showcaseHeroData: text("showcase_hero_data"),
  showcaseWelcomeText: text("showcase_welcome_text"),
  showcaseDetails: text("showcase_details"),
  showcaseSubtitle: text("showcase_subtitle"),
  showcaseTitle: text("showcase_title"),
  showcaseDescription: text("showcase_description"),
  showcaseRsvpTitle: text("showcase_rsvp_title"),
  showcaseRsvpDescription: text("showcase_rsvp_description"),
  showcaseGiftUrl: text("showcase_gift_url"),
  showcaseGiftTitle: text("showcase_gift_title"),
  showcaseGiftDescription: text("showcase_gift_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const kanbanColumns = pgTable("kanban_column", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").default("#6771ab").notNull(),
  position: integer("position").default(0).notNull(),
  type: text("type").default("custom").notNull(), // can be 'todo', 'in_progress', 'done', 'custom'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("task", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  columnId: uuid("column_id").references(() => kanbanColumns.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("todo").notNull(), // backlog, todo, in_progress, done
  dueDate: timestamp("due_date"),
  category: text("category").notNull(), // venue, catering, decor, apparel, invitations, music, rituals, other
  isCustom: boolean("is_custom").default(false).notNull(),
  position: integer("position").default(0).notNull(), // sort order
  ceremonyId: uuid("ceremony_id").references(() => ceremonies.id, { onDelete: "set null" }),
  assignedUserId: text("assigned_user_id").references(() => users.id, { onDelete: "set null" }),
  categoryData: text("category_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ceremonies = pgTable("ceremony", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location").notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  isFoodServed: boolean("is_food_served").default(false).notNull(),
  dressCode: text("dress_code"),
  extraChecklist: text("extra_checklist"), // JSON string
  assignedUserId: text("assigned_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const guests = pgTable("guest", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  loginCode: text("login_code")
    .unique()
    .notNull()
    .$defaultFn(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }),
  rsvpStatus: text("rsvp_status").default("pending").notNull(), // pending, attending, declined
  plusOneCount: integer("plus_one_count").default(0).notNull(),
  dietaryRestrictions: text("dietary_restrictions"),
  invitedCeremonies: text("invited_ceremonies").default("all").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vendors = pgTable("vendor", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(), // catering, photography, decoration, apparel, venue, makeup, music, transport, other
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  totalCost: integer("total_cost").default(0).notNull(), // Contract value
  paidAmount: integer("paid_amount").default(0).notNull(), // Paid amount
  paymentStatus: text("payment_status").default("unpaid").notNull(), // unpaid, partially_paid, paid
  notes: text("notes"),
  ceremonyId: uuid("ceremony_id").references(() => ceremonies.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_key", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const guestRsvps = pgTable("guest_rsvp", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: uuid("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  ceremonyId: uuid("ceremony_id").notNull().references(() => ceremonies.id, { onDelete: "cascade" }),
  rsvpStatus: text("rsvp_status").notNull(), // 'attending', 'declined'
  guestCount: integer("guest_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const weddingTraditions = pgTable("wedding_trad_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  seedTasks: text("seed_tasks"), // JSON string
  seedCeremonies: text("seed_ceremonies"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const taskCategories = pgTable("task_cat_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").unique().notNull(),
  name: text("name").notNull(),
  followUpQuestions: text("follow_up_questions"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rituals = ceremonies;
