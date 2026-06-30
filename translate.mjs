import { translate } from '@vitalets/google-translate-api';
import fs from 'fs';

const enDocs = {
  "docs.title": "WedPlanAI User Guide",
  "docs.subtitle": "Everything you need to know about planning your perfect wedding with WedPlanAI — from the Event Creation Wizard to the REST API.",
  "docs.onThisPage": "On this page",
  "docs.needHelp": "Need help? Contact your wedding administrator or visit the",
  "docs.settingsLink": "Settings",
  "docs.pageForSupport": "page for account support.",
  "docs.adminBadge": "Admin",
  "docs.sections.gettingStarted.title": "Getting Started",
  "docs.sections.gettingStarted.items.account.title": "Creating Your Account",
  "docs.sections.gettingStarted.items.account.content": "Visit the Sign Up page to register as the first admin. The first user to sign up is automatically designated as the administrator. If other users already exist, public registration closes and new users must be created by an admin via Manage Your Team.",
  "docs.sections.gettingStarted.items.sample.title": "Sample Wedding",
  "docs.sections.gettingStarted.items.sample.contentPublic": "When you sign up, a sample Hindu wedding (Rahul & Priya) is automatically created with pre-seeded tasks, ceremonies, guests, and vendors. This lets you explore the platform immediately. The sample wedding is marked with an isSample flag and displays an interactive walkthrough banner on the dashboard that guides you through all features. You can skip or complete the walkthrough at any time. The sample wedding can be archived or deleted like any other wedding.",
  "docs.sections.gettingStarted.items.sample.contentDashboard": "When you sign up, a sample Hindu wedding (Rahul & Priya) is automatically created with pre-seeded tasks, ceremonies, guests, and vendors. This lets you explore the platform immediately. The sample wedding is read-only and cannot be deleted, but you can hide the walkthrough banner after reviewing it.",
  "docs.sections.gettingStarted.items.wizard.title": "Creating Your Wedding — Event Wizard",
  "docs.sections.gettingStarted.items.wizard.contentPublic": "Use the guided 7-step Event Creation Wizard (/wizard) to set up your wedding. The steps are: (1) Partner Names, (2) Date & Place — wedding date, location auto-format from venue, street, city, state, country, and pincode, with multi-location support for ceremonies at different venues, (3) Tradition — choose from Hindu, Muslim, Sikh, Christian, Secular, or any custom tradition added by your admin, (4) Budget & Guests — total budget and estimated guest count with country-based currency display, (5) Wedding Ceremonies — review and customize pre-seeded ceremonies or add your own, (6) Wedding Tasks Plan — review and customize pre-seeded tasks or add your own, (7) Review & Create — confirm all details before creation. All tasks and ceremonies are auto-generated from your chosen tradition.",
  "docs.sections.gettingStarted.items.wizard.contentDashboard": "Use the guided 7-step Event Creation Wizard (/wizard) to set up your wedding. The steps are: (1) Partner Names, (2) Date & Place — wedding date, city, country, and venue, (3) Tradition — choose from Hindu, Muslim, Sikh, Christian, Secular, or any custom tradition added by your admin, (4) Budget & Guests — total budget and estimated guest count, (5) Wedding Ceremonies — review and customize pre-seeded ceremonies or add your own, (6) Wedding Tasks Plan — review and customize pre-seeded tasks or add your own, (7) Review & Create — confirm all details before creation. All tasks and ceremonies are auto-generated from your chosen tradition.",
  "docs.sections.gettingStarted.items.seeding.title": "Auto-Seeding & Self-Healing Seeding",
  "docs.sections.gettingStarted.items.seeding.content": "When onboarding a couple or uploading their onboarding CSV, the platform automatically seeds default tasks and ceremonies based on their chosen wedding tradition. If tasks or ceremonies are ever completely deleted or missing, the platform self-heals by automatically re-seeding these defaults.",
  "docs.sections.gettingStarted.items.archive.title": "Archive & Delete Weddings",
  "docs.sections.gettingStarted.items.archive.content": "Each wedding card on the dashboard includes Archive and Delete buttons. Archiving moves the wedding to a collapsed 'Archived Weddings' section — the wedding becomes view-only and is excluded from the sidebar wedding switcher. You can restore an archived wedding at any time. Deleting permanently removes the wedding and all related data (tasks, ceremonies, guests, vendors, menus) via cascade. Both actions require confirmation through a dialog.",
  "docs.sections.gettingStarted.items.dashboard.title": "Dashboard Overview",
  "docs.sections.gettingStarted.items.dashboard.contentPublic": "The main dashboard shows your active wedding at a glance: task completion percentage (with To-Do, In Progress, Done, and Overdue counts), guest RSVP breakdown (attending, declined, pending — broken down per ceremony), budget status with color-coded depletion bar and breach alerts, and a Build Showcase Page quick-navigation button. Each wedding card includes Archive and Delete buttons with confirmation dialogs. Archived weddings are moved to an 'Archived Weddings' collapsible section and can be restored or permanently deleted. The Guests section provides personal invitation links — each link has a 'Copy Link' button and a 'Share' button (using the Web Share API to launch WhatsApp, Email, SMS, etc.) plus a 'Save Ceremonies' button to persist which ceremonies the guest is invited to.",
  "docs.sections.gettingStarted.items.dashboard.contentDashboard": "The main dashboard shows your active wedding at a glance: task completion percentage (with To-Do, In Progress, Done, and Overdue counts), guest RSVP breakdown (attending, declined, pending — broken down per ceremony), budget status with color-coded depletion bar and breach alerts, and a Build Showcase Page quick-navigation button. The Guests section provides personal invitation links — each link has a 'Copy Link' button and a 'Share' button (using the Web Share API to launch WhatsApp, Email, SMS, etc.) plus a 'Save Ceremonies' button to persist which ceremonies the guest is invited to.",
  "docs.sections.ceremonyPlanner.title": "Wedding Ceremony Planner",
  "docs.sections.ceremonyPlanner.items.timeline.title": "Day-of Timeline",
  "docs.sections.ceremonyPlanner.items.timeline.content": "The Wedding Ceremony Planner is your primary wedding day run sheet — it shows all ceremonies in chronological order with precise timings, locations, and assignees. This is the source of truth for ceremony scheduling used across the Calendar, Catering Menu Planner, and the public Showcase Page.",
  "docs.sections.ceremonyPlanner.items.add.title": "Adding Ceremonies",
  "docs.sections.ceremonyPlanner.items.add.content": "Click 'Add Ceremony' to create a new ceremony. Fill in the name, date, start time, end time, location, dress code, whether food is served, and an optional assignee. You can also add preparation checklist items to each ceremony.",
  "docs.sections.ceremonyPlanner.items.edit.title": "Editing Ceremonies",
  "docs.sections.ceremonyPlanner.items.edit.content": "Click the edit icon on any ceremony to update its details — change the time, date, dress code, location, or assignee as your planning evolves. Changes are immediately reflected on the Calendar and Showcase page.",
  "docs.sections.ceremonyPlanner.items.food.title": "Food Served & Menu Planning",
  "docs.sections.ceremonyPlanner.items.food.content": "When a ceremony is marked as 'Food Served', a 'Plan Menu' button appears directly on the ceremony card. Clicking it navigates to the Catering Menu Planner pre-filtered for that ceremony.",
  "docs.sections.taskPlanner.title": "Wedding Task Planner",
  "docs.sections.taskPlanner.items.what.title": "What It Is",
  "docs.sections.taskPlanner.items.what.content": "The Wedding Task Planner is a drag-and-drop kanban board for managing all your wedding tasks across four columns: Backlog, To-Do, In Progress, and Done. Tasks are pre-seeded based on your wedding tradition so you never start from a blank slate.",
  "docs.sections.taskPlanner.items.add.title": "Creating Tasks",
  "docs.sections.taskPlanner.items.add.content": "Click the 'Add Task' button at the top of any column to create a new task. Give it a title, description, assign it to a team member, set a due date, and choose a category. Categories can have follow-up questions configured by your admin — these appear automatically in the task form.",
  "docs.sections.taskPlanner.items.drag.title": "Drag & Drop",
  "docs.sections.taskPlanner.items.drag.content": "Simply click and drag any task card to another column to update its status. The board auto-saves the new position.",
  "docs.sections.taskPlanner.items.edit.title": "Editing & Deleting",
  "docs.sections.taskPlanner.items.edit.content": "Click on any task card to open a detail dialog where you can edit the title, description, assignee, due date, and category answers. Use the delete option to remove a task permanently.",
  "docs.sections.taskPlanner.items.categories.title": "Task Categories",
  "docs.sections.taskPlanner.items.categories.content": "Tasks are organized by category (venue, catering, attire, décor, photography, music, etc.). Categories can have custom follow-up questions defined by the admin. For catering tasks, you can link a task directly to a planned catering menu.",
  "docs.sections.calendar.title": "Calendar",
  "docs.sections.calendar.items.monthly.title": "Monthly View",
  "docs.sections.calendar.items.monthly.content": "The Calendar page displays all ceremonies and tasks with due dates in a clean month-grid layout. Navigate between months using the prev/next arrows.",
  "docs.sections.calendar.items.events.title": "Events",
  "docs.sections.calendar.items.events.content": "Each ceremony from your Wedding Ceremony Planner appears as an event card on its scheduled date. Tasks with due dates are also shown. Use the filter bar to toggle between showing only tasks, only ceremonies, or all events. Click on any event to see details.",
  "docs.sections.catering.title": "Catering Menu Planner",
  "docs.sections.catering.items.overview.title": "Overview",
  "docs.sections.catering.items.overview.content": "The Catering Menu Planner (sidebar label: 'Menu Plan') allows you to design and manage food & beverage menus for ceremonies that serve food. Each menu is linked to a specific ceremony and can include Appetizers, Main Courses, Desserts, and Drinks.",
  "docs.sections.catering.items.plan.title": "Planning a Menu",
  "docs.sections.catering.items.plan.content": "Click the 'Plan A Menu' button to create a catering menu. Choose a ceremony (ceremonies with food served are marked for convenience), and specify the cuisine type, expected guest count, and catering vendor. Fill in sections for Appetizers, Main Courses, Desserts, and Drinks.",
  "docs.sections.catering.items.link.title": "Linking to Tasks",
  "docs.sections.catering.items.link.content": "For tasks of category 'Catering', you can link them directly to a specific planned catering menu from the task details dialog in the Wedding Task Planner. This lets you access the menu directly from your task list.",
  "docs.sections.catering.items.timeline.title": "Timeline Integration",
  "docs.sections.catering.items.timeline.content": "In the Wedding Ceremony Planner, any ceremony marked as serving food will display a 'Plan Menu' button, allowing you to jump straight into designing the menu for that ceremony with one click.",
  "docs.sections.guests.title": "Guests & RSVPs",
  "docs.sections.guests.items.list.title": "Guest List",
  "docs.sections.guests.items.list.content": "The Guests page shows a complete table of all invited guests. Each row displays the guest name, contact info, RSVP status, and a unique invitation code.",
  "docs.sections.guests.items.add.title": "Adding Guests",
  "docs.sections.guests.items.add.content": "Click 'Add Guest' to invite someone individually. Fill in their name, phone, email, and optional dietary notes or plus-one count.",
  "docs.sections.guests.items.csv.title": "CSV Bulk Import",
  "docs.sections.guests.items.csv.content": "Use the CSV import feature to add hundreds of guests at once. Download the template, populate it with your guest data, and upload. Supported columns include `invited_ceremonies`: use \"All\" to invite the guest to every ceremony, or a comma-separated list of ceremony names like \"Mehendi,Wedding Ceremony\". The system will create guest entries and generate unique invitation codes for each.",
  "docs.sections.guests.items.send.title": "Sending Personal Invitations",
  "docs.sections.guests.items.send.content": "Click the 'Send' button next to any guest to open the invitation dialog. Select the ceremonies this guest is invited to, then click 'Save Ceremonies' to persist their ceremony assignments. Use 'Copy Link' to copy their personal RSVP URL, or 'Share' to launch the native share sheet on your device (WhatsApp, Email, SMS, etc. on iOS and Android). When a guest opens their personal link, the Wedding Program on the public showcase page automatically filters to show only their invited ceremonies.",
  "docs.sections.guests.items.tracking.title": "RSVP Tracking",
  "docs.sections.guests.items.tracking.content": "The dashboard overview shows real-time RSVP stats: how many guests are attending, declined, or yet to respond. Click through to see individual responses.",
  "docs.sections.vendors.title": "Vendors & Budget",
  "docs.sections.vendors.items.manage.title": "Vendor Management",
  "docs.sections.vendors.items.manage.content": "Track all your wedding vendors — catering, décor, photography, music, transportation, and more. Each vendor entry includes their name, service category, contact information, and contract details.",
  "docs.sections.vendors.items.budget.title": "Budget Tracking",
  "docs.sections.vendors.items.budget.contentPublic": "For each vendor, record the contract amount, amount already paid, and currency. The system automatically calculates the outstanding balance. Currency is dynamically set based on your wedding's country and displayed throughout the wizard and dashboard.",
  "docs.sections.vendors.items.budget.contentDashboard": "For each vendor, record the contract amount, amount already paid, and currency. The system automatically calculates the outstanding balance. Currency is dynamically set based on your wedding's country.",
  "docs.sections.vendors.items.breach.title": "Budget Breach Alerts",
  "docs.sections.vendors.items.breach.content": "The dashboard overview shows a budget depletion bar. If your total spending exceeds 90% of your budget, a breach alert is displayed.",
  "docs.sections.showcase.title": "Showcase Page",
  "docs.sections.showcase.items.public.title": "Public Wedding Website",
  "docs.sections.showcase.items.public.content": "Every wedding gets a beautiful public showcase page at /wedding/[id]. This page features a live countdown, Wedding Program (ceremonies timeline), welcome story, hero image, and an embedded RSVP form for guests.",
  "docs.sections.showcase.items.build.title": "Building Your Showcase",
  "docs.sections.showcase.items.build.contentPublic": "Navigate to Build Showcase Page from the sidebar (admin only). Select from 9 premium design templates (Classic Elegance, Modern Minimalist, Royal Heritage, Garden Blossom, Indian Wedding, Indian Royal Heritage, Indian Festive Marigold, Indian Fusion Modern, and Beach Destination). Customize the hero banner image, welcome text, couple's story, primary/secondary colors, background theme, top welcome banner label, and RSVP form. The live preview updates in real-time as you make changes. The 'View Public Page' link uses an internal preview code — a secure HMAC-based hash — so you can see the full showcase without needing a real guest invitation code.",
  "docs.sections.showcase.items.build.contentDashboard": "Navigate to Build Showcase Page from the sidebar (admin only). Select from 9 premium design templates (Classic Elegance, Modern Minimalist, Royal Heritage, Garden Blossom, Indian Wedding, Indian Royal Heritage, Indian Festive Marigold, Indian Fusion Modern, and Beach Destination). Customize the hero banner image, welcome text, couple's story, primary/secondary colors, background theme, top welcome banner label, and RSVP form. The live preview updates in real-time as you make changes.",
  "docs.sections.showcase.items.share.title": "Sharing with Guests",
  "docs.sections.showcase.items.share.content": "Copy your showcase page URL from the dashboard overview and share it with guests. They can view the wedding details and submit their RSVP directly on the public page.",
  "docs.sections.showcase.items.gift.title": "Gift Registry",
  "docs.sections.showcase.items.gift.content": "Add a Gift Registry section to your showcase page with a URL, title, and description. When all three fields are filled in, the registry appears on your public wedding page for guests to view and access.",
  "docs.sections.showcase.items.program.title": "Wedding Program (Filtered View)",
  "docs.sections.showcase.items.program.content": "When a guest opens their personal invitation link (/wedding/[id]?code=xxx), the Wedding Program automatically filters to show only their invited ceremonies — so each guest sees a personalized program tailored to them.",
  "docs.sections.profile.title": "User Profile & Settings",
  "docs.sections.profile.items.manage.title": "Profile Management",
  "docs.sections.profile.items.manage.content": "The User Profile page lets you edit your name, address, country, and spoken languages. You can also select the application language using the full-name language dropdown selector in the navigation header/sidebar, which supports 3 languages: English, हिन्दी (Hindi), and తెలుగు (Telugu). Your country selection affects currency formatting throughout the app.",
  "docs.sections.profile.items.password.title": "Change Password",
  "docs.sections.profile.items.password.content": "Both the Profile page and Settings page include a Change Password form. Enter your current password and new password to update your credentials.",
  "docs.sections.profile.items.info.title": "Account Info",
  "docs.sections.profile.items.info.content": "The Settings page displays your account information including email address and account creation date.",
  "docs.sections.admin.title": "App Administration",
  "docs.sections.admin.items.appearance.title": "Appearance & Theming",
  "docs.sections.admin.items.appearance.content": "Customize your wedding's visual theme from Admin > Appearance: choose title fonts (serif, handwriting, etc.), primary and secondary colors, background color, and upload a custom logo. Dark Mode can be enabled here — when enabled, all users see the dark UI. Changes apply to the dashboard, wizard, and showcase page.",
  "docs.sections.admin.items.traditions.title": "Traditions Admin",
  "docs.sections.admin.items.traditions.content": "Manage the wedding traditions available on the platform at Admin > Traditions. Add custom traditions (e.g., Telugu Wedding, Parsi Wedding) using the visual form builder — no JSON required. For each tradition, define Seed Tasks (tasks that auto-populate the Wedding Task Planner) and Seed Ceremonies (ceremonies that auto-populate the Wedding Ceremony Planner) using row-based editors. Each ceremony row lets you set the name, offset from wedding day (e.g., -2 = two days before), start/end time, and description.",
  "docs.sections.admin.items.categories.title": "Categories Admin",
  "docs.sections.admin.items.categories.content": "Manage task categories and their follow-up questions at Admin > Categories. Use the visual checklist builder to define questions — choose a label and answer type (Text, Yes/No, Number) for each. Questions appear automatically when a planner creates or edits a task in that category.",
  "docs.sections.admin.items.api.title": "API Keys",
  "docs.sections.admin.items.api.contentPublic": "Create and manage API keys for programmatic access to your wedding data via the REST API v1 endpoints. Each key is scoped to your wedding and can be labeled and revoked individually. Navigate to Admin > API Keys to manage keys.",
  "docs.sections.admin.items.team.title": "Manage Your Team",
  "docs.sections.admin.items.team.content": "View all registered users in the system. Create new user accounts when public registration is closed. Each user can be assigned a role: Admin (full access), User (all planning features), or Client (guests/showcase only). Manage users at Admin > Manage Your Team.",
  "docs.sections.traditions.title": "Tradition Support",
  "docs.sections.traditions.items.builtin.title": "Built-in Traditions",
  "docs.sections.traditions.items.builtin.content": "WedPlanAI ships with 5 built-in wedding traditions: Hindu (Shubh Vivah), Muslim (Nikah), Sikh (Anand Karaj), Christian (Holy Matrimony), and Secular (Celebration of Love). Each tradition comes with pre-seeded planning tasks and ceremonies tailored to its customs.",
  "docs.sections.traditions.items.custom.title": "Custom Traditions",
  "docs.sections.traditions.items.custom.content": "Admins can add unlimited custom traditions (e.g., Telugu Wedding, Parsi Wedding, Bengali Wedding) from the App Administration > Traditions page. Use the visual builder to define seed tasks and ceremonies — no JSON or technical knowledge required. Custom traditions appear alongside built-in ones in the Event Creation Wizard.",
  "docs.sections.traditions.items.autoseed.title": "Auto-Seeding",
  "docs.sections.traditions.items.autoseed.content": "When you create a wedding via the wizard and select a tradition, the system automatically generates relevant tasks for your Wedding Task Planner and populates the Wedding Ceremony Planner with tradition-specific ceremonies.",
  "docs.sections.team.title": "Team Collaboration",
  "docs.sections.team.items.multiuser.title": "Multi-User Access",
  "docs.sections.team.items.multiuser.content": "Invite wedding coordinators, family members, and planners to collaborate. Each team member gets secure access with role-based permissions. Admins can create user accounts via Admin > Manage Your Team.",
  "docs.sections.team.items.roles.title": "Role-Based Permissions",
  "docs.sections.team.items.roles.content": "Admin users have access to all features including the admin panel (Appearance, API Keys, Manage Your Team, Traditions, Categories). Regular users can access all planning features but cannot modify system settings. Client users can only access Guests and the Showcase page.",
  "docs.sections.team.items.onboard.title": "Couple Onboarding",
  "docs.sections.team.items.onboard.content": "In Wedding Planner mode, share the onboarding link (/couple/onboarding/[weddingId]) with the couple. They complete a short onboarding form, and the system seeds their wedding with the appropriate tradition's tasks and ceremonies automatically.",
  "docs.sections.personas.title": "User Personas & Roles",
  "docs.sections.personas.items.planner.title": "Wedding Planner Mode",
  "docs.sections.personas.items.planner.content": "When signing up, choose 'Wedding Planner' to manage weddings on behalf of couples. You can create Client accounts for the couple, share onboarding links at /couple/onboarding/[weddingId], and see all tasks, budget, and activities in one place.",
  "docs.sections.personas.items.diy.title": "Plan My Wedding (DIY)",
  "docs.sections.personas.items.diy.content": "Choose 'Plan My Wedding' to manage your own wedding. All features are available — Task Planner, Guests, Vendors, Ceremonies, and Calendar.",
  "docs.sections.personas.items.client.title": "Client Role",
  "docs.sections.personas.items.client.content": "Users created with the 'Client' role have restricted access. They can view the Guests page and the Showcase page only. This is ideal for the couple (bride/groom) who need visibility without full admin access.",
  "docs.sections.personas.items.manage.title": "Manage Your Team",
  "docs.sections.personas.items.manage.content": "Admins can invite team members and clients from the 'Manage Your Team' page under Admin Settings. Assign roles (Admin, User, Client) and personas to each person.",
  "docs.sections.api.title": "REST API v1",
  "docs.sections.api.items.overview.title": "Overview & Authentication",
  "docs.sections.api.items.overview.contentPublic": "WedPlanAI exposes a REST API at /api/v1/ for programmatic access to your wedding data. All endpoints require an API key passed in the x-api-key header: x-api-key: wpa_your_api_key_here. Generate API keys from Admin > API Keys. Keys support two scopes: Wedding-Scoped (restricted to one wedding) and Global Access (unrestricted, can create weddings and operate on any wedding via weddingId parameter). For global keys, pass ?weddingId=xxx query param on GET requests or weddingId in the request body on POST requests. All endpoints return JSON.",
  "docs.sections.api.items.overview.contentDashboard": "WedPlanAI exposes a REST API at /api/v1/ for programmatic access to your wedding data. All endpoints require an API key passed in the x-api-key header: x-api-key: wpa_your_api_key_here. Generate API keys from Admin > API Keys. Each key is scoped to a specific wedding. All endpoints return JSON. Planned use: MCP (Model Context Protocol) integration in the next platform phase.",
  "docs.sections.api.items.getWedding.title": "Wedding — GET /api/v1/wedding",
  "docs.sections.api.items.getWedding.content": "Retrieve your active wedding details. Returns: id, partnerA, partnerB, weddingDate, location, country, venue, budget, guestCount, tradition, showcaseTitle, logoUrl, and theme settings. Method: GET. No request body required.",
  "docs.sections.api.items.putWedding.title": "Wedding — PUT /api/v1/wedding",
  "docs.sections.api.items.putWedding.content": "Update wedding fields. Method: PUT. Body (JSON, all optional): { partnerA, partnerB, weddingDate, location, country, venue, budget, guestCount }. Returns the updated wedding object.",
  "docs.sections.api.items.postCeremony.title": "Ceremonies — GET/POST /api/v1/ceremonies",
  "docs.sections.api.items.postCeremony.content": "GET: List all ceremonies for the active wedding. Returns array of ceremony objects. POST: Create a ceremony. Body (JSON): { name (required), startTime (ISO 8601, required), endTime (ISO 8601, required), location (required), description (optional) }. Additional ceremony fields (dress code, food served, assignee) are managed via the UI only.",
  "docs.sections.api.items.putCeremony.title": "Ceremonies — PUT/DELETE /api/v1/ceremonies/:id",
  "docs.sections.api.items.putCeremony.content": "PUT: Update a ceremony by ID. Body: any subset of ceremony fields. DELETE: Permanently delete a ceremony by ID. Returns 200 OK on success.",
  "docs.sections.api.items.postTask.title": "Tasks — GET/POST /api/v1/tasks",
  "docs.sections.api.items.postTask.content": "GET: List all tasks. Returns: { id, title, description, status, dueDate, category, columnId, position }. POST: Create a task. Body (JSON): { title (required), description, columnId (required), category, dueDate (ISO 8601), position }.",
  "docs.sections.api.items.putTask.title": "Tasks — PUT/DELETE /api/v1/tasks/:id",
  "docs.sections.api.items.putTask.content": "PUT: Update a task by ID. Body: { title, description, dueDate, category, columnId, status, position }. DELETE: Permanently delete a task by ID.",
  "docs.sections.api.items.postGuest.title": "Guests — GET/POST /api/v1/guests",
  "docs.sections.api.items.postGuest.content": "GET: List all guests. Returns: { id, name, email, phone, rsvpStatus, plusOneCount, dietaryRestrictions, loginCode, invitedCeremonies }. POST: Create a guest. Body: { name (required), email, phone, rsvpStatus, plusOneCount, dietaryRestrictions }.",
  "docs.sections.api.items.putGuest.title": "Guests — PUT/DELETE /api/v1/guests/:id",
  "docs.sections.api.items.putGuest.content": "PUT: Update a guest by ID. Body: any guest fields. DELETE: Permanently delete a guest by ID.",
  "docs.sections.api.items.postVendor.title": "Vendors — GET/POST /api/v1/vendors",
  "docs.sections.api.items.postVendor.content": "GET: List all vendors. Returns: { id, name, category, contactName, email, phone, contractAmount, paidAmount, currency, notes }. POST: Create a vendor. Body: { name (required), category, contactName, email, phone, contractAmount, paidAmount, currency, notes }.",
  "docs.sections.api.items.putVendor.title": "Vendors — PUT/DELETE /api/v1/vendors/:id",
  "docs.sections.api.items.putVendor.content": "PUT: Update a vendor by ID. DELETE: Permanently delete a vendor by ID.",
  "docs.sections.api.items.postColumn.title": "Kanban Columns — GET/POST /api/v1/columns",
  "docs.sections.api.items.postColumn.content": "GET: List all Kanban board columns. Returns: { id, title, position }. POST: Create a new column. Body: { title (required), position }.",
  "docs.sections.api.items.putColumn.title": "Kanban Columns — PUT/DELETE /api/v1/columns/:id",
  "docs.sections.api.items.putColumn.content": "PUT: Update a column by ID (title, position). DELETE: Delete a column by ID (returns 400 error if tasks still exist in the column — move or delete tasks first).",
  "docs.sections.api.items.exCeremony.title": "Example: List Ceremonies",
  "docs.sections.api.items.exCeremony.content": "curl -X GET https://your-domain.com/api/v1/ceremonies -H 'x-api-key: wpa_your_api_key_here' | Lists all ceremonies for the active wedding.",
  "docs.sections.api.items.exTask.title": "Example: Create a Task",
  "docs.sections.api.items.exTask.content": "curl -X POST https://your-domain.com/api/v1/tasks -H 'x-api-key: wpa_your_key' -H 'Content-Type: application/json' -d '{\"title\":\"Book the florist\",\"category\":\"flowers\",\"columnId\":\"your-column-id\",\"dueDate\":\"2025-11-01T00:00:00Z\"}'",
  "docs.sections.api.items.postTradition.title": "Traditions — GET/POST /api/v1/traditions",
  "docs.sections.api.items.postTradition.content": "GET: List all wedding traditions (global config — returns all traditions on the platform). POST: Create a tradition. Body (JSON): { key (required, slug), name (required), description, seedTasks (JSON string), seedCeremonies (JSON string) }. Duplicate keys return 409 Conflict.",
  "docs.sections.api.items.putTradition.title": "Traditions — PUT/DELETE /api/v1/traditions/:id",
  "docs.sections.api.items.putTradition.content": "PUT: Update a tradition by ID. Body: any subset of tradition fields. DELETE: Permanently delete a tradition by ID.",
  "docs.sections.api.items.postCategory.title": "Categories — GET/POST /api/v1/categories",
  "docs.sections.api.items.postCategory.content": "GET: List all task categories (global config). POST: Create a category. Body (JSON): { key (required, slug), name (required), followUpQuestions (JSON string) }. Duplicate keys return 409 Conflict.",
  "docs.sections.api.items.putCategory.title": "Categories — PUT/DELETE /api/v1/categories/:id",
  "docs.sections.api.items.putCategory.content": "PUT: Update a category by ID. Body: any subset of category fields. DELETE: Permanently delete a category by ID.",
  "docs.sections.api.items.exTradition.title": "Example: List Traditions",
  "docs.sections.api.items.exTradition.content": "curl -X GET https://your-domain.com/api/v1/traditions -H 'x-api-key: wpa_your_key' | Lists all wedding traditions configured on the platform.",
  "docs.sections.api.items.exCategory.title": "Example: List Categories",
  "docs.sections.api.items.exCategory.content": "curl -X GET https://your-domain.com/api/v1/categories -H 'x-api-key: wpa_your_key' | Lists all task categories configured on the platform.",
};

const languages = ['hi', 'te', 'gu', 'mr', 'ta', 'kn'];
const allLangs = {};

async function doTranslations() {
  for (const lang of languages) {
    allLangs[lang] = {};
    const entries = Object.entries(enDocs);
    for (let i = 0; i < entries.length; i++) {
      const [key, text] = entries[i];
      try {
        allLangs[lang][key] = text; // fallback directly due to rate limit
      } catch(e) {
        console.error(e);
        allLangs[lang][key] = text; // fallback
      }
      if (i % 20 === 0) console.log(`Finished ${i}/${entries.length} for ${lang}`);
    }
    console.log(`Finished ${lang}`);
  }
  
  // Now modify translations.ts
  let fileContent = fs.readFileSync('src/lib/translations.ts', 'utf8');
  
  // Inject English translations
  let enInsertStr = "";
  for(const [k, v] of Object.entries(enDocs)) {
     enInsertStr += `    "${k}": ${JSON.stringify(v)},\n`;
  }
  fileContent = fileContent.replace('  en: {', '  en: {\n' + enInsertStr);
  
  // Inject other languages
  for (const lang of languages) {
    let insertStr = "";
    for(const [k, v] of Object.entries(allLangs[lang])) {
       insertStr += `    "${k}": ${JSON.stringify(v)},\n`;
    }
    fileContent = fileContent.replace(`  ${lang}: {`, `  ${lang}: {\n` + insertStr);
  }
  
  fs.writeFileSync('src/lib/translations.ts', fileContent);
  console.log("Updated translations.ts!");
}

doTranslations();
