import crypto from "crypto";
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
  weddingAccess: text("wedding_access").default("all").notNull(),
  shouldChangePassword: boolean("should_change_password").default(false).notNull(),
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
  partnerAParents: text("partner_a_parents"),
  partnerBParents: text("partner_b_parents"),
  brideFather: text("bride_father"),
  brideMother: text("bride_mother"),
  groomFather: text("groom_father"),
  groomMother: text("groom_mother"),
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
  locationOptions: text("location_options"),
  isSample: boolean("is_sample").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  themeFont: text("theme_font").default("Geist").notNull(),
  themePrimary: text("theme_primary").default("#6771ab").notNull(),
  themeSecondary: text("theme_secondary").default("#8b93c5").notNull(),
  themeBackground: text("theme_background").default("#f8fafc").notNull(),
  themeDarkPrimary: text("theme_dark_primary").default("#808bc6").notNull(),
  themeDarkSecondary: text("theme_dark_secondary").default("#9fa7d6").notNull(),
  themeDarkBackground: text("theme_dark_background").default("#0b0f19").notNull(),
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
  showcaseTemplate: text("showcase_template").default("classic").notNull(),
  showcaseTopLabel: text("showcase_top_label").default("").notNull(),
  enableChat: boolean("enable_chat").default(true).notNull(),
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

export const cateringMenus = pgTable("catering_menu", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  ceremonyId: uuid("ceremony_id").notNull().references(() => ceremonies.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  cuisine: text("cuisine"),
  guestCount: integer("guest_count").default(0).notNull(),
  appetizers: text("appetizers"),
  mainCourses: text("main_courses"),
  desserts: text("desserts"),
  drinks: text("drinks"),
  notes: text("notes"),
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
  cateringMenuId: uuid("catering_menu_id").references(() => cateringMenus.id, { onDelete: "set null" }),
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
      return crypto.randomBytes(3).toString('hex');
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
  weddingId: uuid("wedding_id").references((): any => weddings.id, { onDelete: "cascade" }),
  scope: text("scope").default("wedding").notNull(),
  userId: text("user_id"),
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

export const emailConfigurations = pgTable("email_configuration", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull(), // 'gmail', 'sendgrid', or 'disabled'
  senderEmail: text("sender_email").notNull(),
  clientId: text("client_id"),
  clientSecret: text("client_secret"),
  refreshToken: text("refresh_token"),
  apiKey: text("api_key"),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_message", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email"),
  senderRole: text("sender_role").notNull(), // 'admin', 'user', 'client', 'guest'
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rituals = ceremonies;
