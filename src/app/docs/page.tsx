import Link from "next/link";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    items: [
      {
        title: "Creating Your Account",
        content:
          "Visit the Sign Up page to register as the first admin. The first user to sign up is automatically designated as the administrator. If other users already exist, public registration closes and new users must be created by an admin via Manage Your Team.",
      },
      {
        title: "Sample Wedding",
        content:
          "When you sign up, a sample Hindu wedding (Rahul & Priya) is automatically created with pre-seeded tasks, ceremonies, guests, and vendors. This lets you explore the platform immediately. The sample wedding is marked with an isSample flag and displays an interactive walkthrough banner on the dashboard that guides you through all features. You can skip or complete the walkthrough at any time. The sample wedding can be archived or deleted like any other wedding.",
      },
      {
        title: "Creating Your Wedding — Event Wizard",
        content:
          "Use the guided 7-step Event Creation Wizard (/wizard) to set up your wedding. The steps are: (1) Partner Names, (2) Date & Place — wedding date, location auto-format from venue, street, city, state, country, and pincode, with multi-location support for ceremonies at different venues, (3) Tradition — choose from Hindu, Muslim, Sikh, Christian, Secular, or any custom tradition added by your admin, (4) Budget & Guests — total budget and estimated guest count with country-based currency display, (5) Wedding Ceremonies — review and customize pre-seeded ceremonies or add your own, (6) Wedding Tasks Plan — review and customize pre-seeded tasks or add your own, (7) Review & Create — confirm all details before creation. All tasks and ceremonies are auto-generated from your chosen tradition.",
      },
      {
        title: "Auto-Seeding & Self-Healing Seeding",
        content:
          "When onboarding a couple or uploading their onboarding CSV, the platform automatically seeds default tasks and ceremonies based on their chosen wedding tradition. If tasks or ceremonies are ever completely deleted or missing, the platform self-heals by automatically re-seeding these defaults.",
      },
      {
        title: "Archive & Delete Weddings",
        content:
          "Each wedding card on the dashboard includes Archive and Delete buttons. Archiving moves the wedding to a collapsed 'Archived Weddings' section — the wedding becomes view-only and is excluded from the sidebar wedding switcher. You can restore an archived wedding at any time. Deleting permanently removes the wedding and all related data (tasks, ceremonies, guests, vendors, menus) via cascade. Both actions require confirmation through a dialog.",
      },
      {
        title: "Dashboard Overview",
        content:
          "The main dashboard shows your active wedding at a glance: task completion percentage (with To-Do, In Progress, Done, and Overdue counts), guest RSVP breakdown (attending, declined, pending — broken down per ceremony), budget status with color-coded depletion bar and breach alerts, and a Build Showcase Page quick-navigation button. Each wedding card includes Archive and Delete buttons with confirmation dialogs. Archived weddings are moved to an 'Archived Weddings' collapsible section and can be restored or permanently deleted. The Guests section provides personal invitation links — each link has a 'Copy Link' button and a 'Share' button (using the Web Share API to launch WhatsApp, Email, SMS, etc.) plus a 'Save Ceremonies' button to persist which ceremonies the guest is invited to.",
      },
    ],
  },
  {
    id: "wedding-ceremony-planner",
    title: "Wedding Ceremony Planner",
    icon: "⏱️",
    items: [
      {
        title: "Day-of Timeline",
        content:
          "The Wedding Ceremony Planner is your primary wedding day run sheet — it shows all ceremonies in chronological order with precise timings, locations, and assignees. This is the source of truth for ceremony scheduling used across the Calendar, Catering Menu Planner, and the public Showcase Page.",
      },
      {
        title: "Adding Ceremonies",
        content:
          "Click 'Add Ceremony' to create a new ceremony. Fill in the name, date, start time, end time, location, dress code, whether food is served, and an optional assignee. You can also add preparation checklist items to each ceremony.",
      },
      {
        title: "Editing Ceremonies",
        content:
          "Click the edit icon on any ceremony to update its details — change the time, date, dress code, location, or assignee as your planning evolves. Changes are immediately reflected on the Calendar and Showcase page.",
      },
      {
        title: "Food Served & Menu Planning",
        content:
          "When a ceremony is marked as 'Food Served', a 'Plan Menu' button appears directly on the ceremony card. Clicking it navigates to the Catering Menu Planner pre-filtered for that ceremony.",
      },
    ],
  },
  {
    id: "wedding-task-planner",
    title: "Wedding Task Planner",
    icon: "📋",
    items: [
      {
        title: "What It Is",
        content:
          "The Wedding Task Planner is a drag-and-drop kanban board for managing all your wedding tasks across four columns: Backlog, To-Do, In Progress, and Done. Tasks are pre-seeded based on your wedding tradition so you never start from a blank slate.",
      },
      {
        title: "Creating Tasks",
        content:
          "Click the 'Add Task' button at the top of any column to create a new task. Give it a title, description, assign it to a team member, set a due date, and choose a category. Categories can have follow-up questions configured by your admin — these appear automatically in the task form.",
      },
      {
        title: "Drag & Drop",
        content:
          "Simply click and drag any task card to another column to update its status. The board auto-saves the new position.",
      },
      {
        title: "Editing & Deleting",
        content:
          "Click on any task card to open a detail dialog where you can edit the title, description, assignee, due date, and category answers. Use the delete option to remove a task permanently.",
      },
      {
        title: "Task Categories",
        content:
          "Tasks are organized by category (venue, catering, attire, décor, photography, music, etc.). Categories can have custom follow-up questions defined by the admin. For catering tasks, you can link a task directly to a planned catering menu.",
      },
    ],
  },
  {
    id: "calendar",
    title: "Calendar",
    icon: "📅",
    items: [
      {
        title: "Monthly View",
        content:
          "The Calendar page displays all ceremonies and tasks with due dates in a clean month-grid layout. Navigate between months using the prev/next arrows.",
      },
      {
        title: "Events",
        content:
          "Each ceremony from your Wedding Ceremony Planner appears as an event card on its scheduled date. Tasks with due dates are also shown. Use the filter bar to toggle between showing only tasks, only ceremonies, or all events. Click on any event to see details.",
      },
    ],
  },
  {
    id: "catering-menu-planner",
    title: "Catering Menu Planner",
    icon: "🍴",
    items: [
      {
        title: "Overview",
        content:
          "The Catering Menu Planner (sidebar label: 'Menu Plan') allows you to design and manage food & beverage menus for ceremonies that serve food. Each menu is linked to a specific ceremony and can include Appetizers, Main Courses, Desserts, and Drinks.",
      },
      {
        title: "Planning a Menu",
        content:
          "Click the 'Plan A Menu' button to create a catering menu. Choose a ceremony (ceremonies with food served are marked for convenience), and specify the cuisine type, expected guest count, and catering vendor. Fill in sections for Appetizers, Main Courses, Desserts, and Drinks.",
      },
      {
        title: "Linking to Tasks",
        content:
          "For tasks of category 'Catering', you can link them directly to a specific planned catering menu from the task details dialog in the Wedding Task Planner. This lets you access the menu directly from your task list.",
      },
      {
        title: "Timeline Integration",
        content:
          "In the Wedding Ceremony Planner, any ceremony marked as serving food will display a 'Plan Menu' button, allowing you to jump straight into designing the menu for that ceremony with one click.",
      },
    ],
  },
  {
    id: "guests",
    title: "Guests & RSVPs",
    icon: "👥",
    items: [
      {
        title: "Guest List",
        content:
          "The Guests page shows a complete table of all invited guests. Each row displays the guest name, contact info, RSVP status, and a unique invitation code.",
      },
      {
        title: "Adding Guests",
        content:
          "Click 'Add Guest' to invite someone individually. Fill in their name, phone, email, and optional dietary notes or plus-one count.",
      },
      {
        title: "CSV Bulk Import",
        content:
          "Use the CSV import feature to add hundreds of guests at once. Download the template, populate it with your guest data, and upload. Supported columns include `invited_ceremonies`: use \"All\" to invite the guest to every ceremony, or a comma-separated list of ceremony names like \"Mehendi,Wedding Ceremony\". The system will create guest entries and generate unique invitation codes for each.",
      },
      {
        title: "Sending Personal Invitations",
        content:
          "Click the 'Send' button next to any guest to open the invitation dialog. Select the ceremonies this guest is invited to, then click 'Save Ceremonies' to persist their ceremony assignments. Use 'Copy Link' to copy their personal RSVP URL, or 'Share' to launch the native share sheet on your device (WhatsApp, Email, SMS, etc. on iOS and Android). When a guest opens their personal link, the Wedding Program on the public showcase page automatically filters to show only their invited ceremonies.",
      },
      {
        title: "RSVP Tracking",
        content:
          "The dashboard overview shows real-time RSVP stats: how many guests are attending, declined, or yet to respond. Click through to see individual responses.",
      },
    ],
  },
  {
    id: "vendors",
    title: "Vendors & Budget",
    icon: "🏪",
    items: [
      {
        title: "Vendor Management",
        content:
          "Track all your wedding vendors — catering, décor, photography, music, transportation, and more. Each vendor entry includes their name, service category, contact information, and contract details.",
      },
      {
        title: "Budget Tracking",
        content:
          "For each vendor, record the contract amount, amount already paid, and currency. The system automatically calculates the outstanding balance. Currency is dynamically set based on your wedding's country and displayed throughout the wizard and dashboard.",
      },
      {
        title: "Budget Breach Alerts",
        content:
          "The dashboard overview shows a budget depletion bar. If your total spending exceeds 90% of your budget, a breach alert is displayed.",
      },
    ],
  },
  {
    id: "showcase",
    title: "Showcase Page",
    icon: "🌐",
    items: [
      {
        title: "Public Wedding Website",
        content:
          "Every wedding gets a beautiful public showcase page at /wedding/[id]. This page features a live countdown, Wedding Program (ceremonies timeline), welcome story, hero image, and an embedded RSVP form for guests.",
      },
      {
        title: "Building Your Showcase",
        content:
          "Navigate to Build Showcase Page from the sidebar (admin only). Select from 9 premium design templates (Classic Elegance, Modern Minimalist, Royal Heritage, Garden Blossom, Indian Wedding, Indian Royal Heritage, Indian Festive Marigold, Indian Fusion Modern, and Beach Destination). Customize the hero banner image, welcome text, couple's story, primary/secondary colors, background theme, top welcome banner label, and RSVP form. The live preview updates in real-time as you make changes. The 'View Public Page' link uses an internal preview code — a secure HMAC-based hash — so you can see the full showcase without needing a real guest invitation code.",
      },
      {
        title: "Sharing with Guests",
        content:
          "Copy your showcase page URL from the dashboard overview and share it with guests. They can view the wedding details and submit their RSVP directly on the public page.",
      },
      {
        title: "Gift Registry",
        content:
          "Add a Gift Registry section to your showcase page with a URL, title, and description. When all three fields are filled in, the registry appears on your public wedding page for guests to view and access.",
      },
      {
        title: "Wedding Program (Filtered View)",
        content:
          "When a guest opens their personal invitation link (/wedding/[id]?code=xxx), the Wedding Program automatically filters to show only their invited ceremonies — so each guest sees a personalized program tailored to them.",
      },
    ],
  },
  {
    id: "profile",
    title: "User Profile & Settings",
    icon: "⚙️",
    items: [
      {
        title: "Profile Management",
        content:
          "The User Profile page lets you edit your name, address, country, and spoken languages. You can also select the application language using the full-name language dropdown selector in the navigation header/sidebar, which supports 3 languages: English, हिन्दी (Hindi), and తెలుగు (Telugu). Your country selection affects currency formatting throughout the app.",
      },
      {
        title: "Change Password",
        content:
          "Both the Profile page and Settings page include a Change Password form. Enter your current password and new password to update your credentials.",
      },
      {
        title: "Account Info",
        content:
          "The Settings page displays your account information including email address and account creation date.",
      },
    ],
  },
  {
    id: "admin",
    title: "App Administration",
    icon: "🛡️",
    admin: true,
    items: [
      {
        title: "Appearance & Theming",
        content:
          "Customize your wedding's visual theme from Admin > Appearance: choose title fonts (serif, handwriting, etc.), primary and secondary colors, background color, and upload a custom logo. Dark Mode can be enabled here — when enabled, all users see the dark UI. Changes apply to the dashboard, wizard, and showcase page.",
      },
      {
        title: "Traditions Admin",
        content:
          "Manage the wedding traditions available on the platform at Admin > Traditions. Add custom traditions (e.g., Telugu Wedding, Parsi Wedding) using the visual form builder — no JSON required. For each tradition, define Seed Tasks (tasks that auto-populate the Wedding Task Planner) and Seed Ceremonies (ceremonies that auto-populate the Wedding Ceremony Planner) using row-based editors. Each ceremony row lets you set the name, offset from wedding day (e.g., -2 = two days before), start/end time, and description.",
      },
      {
        title: "Categories Admin",
        content:
          "Manage task categories and their follow-up questions at Admin > Categories. Use the visual checklist builder to define questions — choose a label and answer type (Text, Yes/No, Number) for each. Questions appear automatically when a planner creates or edits a task in that category.",
      },
      {
        title: "API Keys",
        content:
          "Create and manage API keys for programmatic access to your wedding data via the REST API v1 endpoints. Each key is scoped to your wedding and can be labeled and revoked individually. Navigate to Admin > API Keys to manage keys.",
      },
      {
        title: "Manage Your Team",
        content:
          "View all registered users in the system. Create new user accounts when public registration is closed. Each user can be assigned a role: Admin (full access), User (all planning features), or Client (guests/showcase only). Manage users at Admin > Manage Your Team.",
      },
    ],
  },
  {
    id: "traditions",
    title: "Tradition Support",
    icon: "🌟",
    items: [
      {
        title: "Built-in Traditions",
        content:
          "WedPlanAI ships with 5 built-in wedding traditions: Hindu (Shubh Vivah), Muslim (Nikah), Sikh (Anand Karaj), Christian (Holy Matrimony), and Secular (Celebration of Love). Each tradition comes with pre-seeded planning tasks and ceremonies tailored to its customs.",
      },
      {
        title: "Custom Traditions",
        content:
          "Admins can add unlimited custom traditions (e.g., Telugu Wedding, Parsi Wedding, Bengali Wedding) from the App Administration > Traditions page. Use the visual builder to define seed tasks and ceremonies — no JSON or technical knowledge required. Custom traditions appear alongside built-in ones in the Event Creation Wizard.",
      },
      {
        title: "Auto-Seeding",
        content:
          "When you create a wedding via the wizard and select a tradition, the system automatically generates relevant tasks for your Wedding Task Planner and populates the Wedding Ceremony Planner with tradition-specific ceremonies.",
      },
    ],
  },
  {
    id: "team",
    title: "Team Collaboration",
    icon: "🤝",
    items: [
      {
        title: "Multi-User Access",
        content:
          "Invite wedding coordinators, family members, and planners to collaborate. Each team member gets secure access with role-based permissions. Admins can create user accounts via Admin > Manage Your Team.",
      },
      {
        title: "Role-Based Permissions",
        content:
          "Admin users have access to all features including the admin panel (Appearance, API Keys, Manage Your Team, Traditions, Categories). Regular users can access all planning features but cannot modify system settings. Client users can only access Guests and the Showcase page.",
      },
      {
        title: "Couple Onboarding",
        content:
          "In Wedding Planner mode, share the onboarding link (/couple/onboarding/[weddingId]) with the couple. They complete a short onboarding form, and the system seeds their wedding with the appropriate tradition's tasks and ceremonies automatically.",
      },
    ],
  },
];

const personasSection = {
  id: "personas",
  title: "User Personas & Roles",
  icon: "👥",
  items: [
    {
      title: "Wedding Planner Mode",
      content:
        "When signing up, choose 'Wedding Planner' to manage weddings on behalf of couples. You can create Client accounts for the couple, share onboarding links at /couple/onboarding/[weddingId], and see all tasks, budget, and activities in one place.",
    },
    {
      title: "Plan My Wedding (DIY)",
      content:
        "Choose 'Plan My Wedding' to manage your own wedding. All features are available — Task Planner, Guests, Vendors, Ceremonies, and Calendar.",
    },
    {
      title: "Client Role",
      content:
        "Users created with the 'Client' role have restricted access. They can view the Guests page and the Showcase page only. This is ideal for the couple (bride/groom) who need visibility without full admin access.",
    },
    {
      title: "Manage Your Team",
      content:
        "Admins can invite team members and clients from the 'Manage Your Team' page under Admin Settings. Assign roles (Admin, User, Client) and personas to each person.",
    },
  ],
};

const apiSection = {
  id: "api",
  title: "REST API v1",
  icon: "🔌",
  admin: true,
  items: [
    {
      title: "Overview & Authentication",
      content:
        "WedPlanAI exposes a REST API at /api/v1/ for programmatic access to your wedding data. All endpoints require an API key passed in the x-api-key header: x-api-key: wpa_your_api_key_here. Generate API keys from Admin > API Keys. Keys support two scopes: Wedding-Scoped (restricted to one wedding) and Global Access (unrestricted, can create weddings and operate on any wedding via weddingId parameter). For global keys, pass ?weddingId=xxx query param on GET requests or weddingId in the request body on POST requests. All endpoints return JSON.",
    },
    {
      title: "Wedding — GET /api/v1/wedding",
      content:
        "Retrieve your active wedding details. Returns: id, partnerA, partnerB, weddingDate, location, country, venue, budget, guestCount, tradition, showcaseTitle, logoUrl, and theme settings. Method: GET. No request body required.",
    },
    {
      title: "Wedding — PUT /api/v1/wedding",
      content:
        "Update wedding fields. Method: PUT. Body (JSON, all optional): { partnerA, partnerB, weddingDate, location, country, venue, budget, guestCount }. Returns the updated wedding object.",
    },
    {
      title: "Ceremonies — GET/POST /api/v1/ceremonies",
      content:
        "GET: List all ceremonies for the active wedding. Returns array of ceremony objects. POST: Create a ceremony. Body (JSON): { name (required), startTime (ISO 8601, required), endTime (ISO 8601, required), location (required), description (optional) }. Additional ceremony fields (dress code, food served, assignee) are managed via the UI only.",
    },
    {
      title: "Ceremonies — PUT/DELETE /api/v1/ceremonies/:id",
      content:
        "PUT: Update a ceremony by ID. Body: any subset of ceremony fields. DELETE: Permanently delete a ceremony by ID. Returns 200 OK on success.",
    },
    {
      title: "Tasks — GET/POST /api/v1/tasks",
      content:
        "GET: List all tasks. Returns: { id, title, description, status, dueDate, category, columnId, position }. POST: Create a task. Body (JSON): { title (required), description, columnId (required), category, dueDate (ISO 8601), position }.",
    },
    {
      title: "Tasks — PUT/DELETE /api/v1/tasks/:id",
      content:
        "PUT: Update a task by ID. Body: { title, description, dueDate, category, columnId, status, position }. DELETE: Permanently delete a task by ID.",
    },
    {
      title: "Guests — GET/POST /api/v1/guests",
      content:
        "GET: List all guests. Returns: { id, name, email, phone, rsvpStatus, plusOneCount, dietaryRestrictions, loginCode, invitedCeremonies }. POST: Create a guest. Body: { name (required), email, phone, rsvpStatus, plusOneCount, dietaryRestrictions }.",
    },
    {
      title: "Guests — PUT/DELETE /api/v1/guests/:id",
      content:
        "PUT: Update a guest by ID. Body: any guest fields. DELETE: Permanently delete a guest by ID.",
    },
    {
      title: "Vendors — GET/POST /api/v1/vendors",
      content:
        "GET: List all vendors. Returns: { id, name, category, contactName, email, phone, contractAmount, paidAmount, currency, notes }. POST: Create a vendor. Body: { name (required), category, contactName, email, phone, contractAmount, paidAmount, currency, notes }.",
    },
    {
      title: "Vendors — PUT/DELETE /api/v1/vendors/:id",
      content:
        "PUT: Update a vendor by ID. DELETE: Permanently delete a vendor by ID.",
    },
    {
      title: "Kanban Columns — GET/POST /api/v1/columns",
      content:
        "GET: List all Kanban board columns. Returns: { id, title, position }. POST: Create a new column. Body: { title (required), position }.",
    },
    {
      title: "Kanban Columns — PUT/DELETE /api/v1/columns/:id",
      content:
        "PUT: Update a column by ID (title, position). DELETE: Delete a column by ID (returns 400 error if tasks still exist in the column — move or delete tasks first).",
    },
    {
      title: "Example: List Ceremonies",
      content:
        "curl -X GET https://your-domain.com/api/v1/ceremonies -H 'x-api-key: wpa_your_api_key_here' | Lists all ceremonies for the active wedding.",
    },
    {
      title: "Example: Create a Task",
      content:
        "curl -X POST https://your-domain.com/api/v1/tasks -H 'x-api-key: wpa_your_key' -H 'Content-Type: application/json' -d '{\"title\":\"Book the florist\",\"category\":\"flowers\",\"columnId\":\"your-column-id\",\"dueDate\":\"2025-11-01T00:00:00Z\"}'",
    },
    {
      title: "Traditions — GET/POST /api/v1/traditions",
      content:
        "GET: List all wedding traditions (global config — returns all traditions on the platform). POST: Create a tradition. Body (JSON): { key (required, slug), name (required), description, seedTasks (JSON string), seedCeremonies (JSON string) }. Duplicate keys return 409 Conflict.",
    },
    {
      title: "Traditions — PUT/DELETE /api/v1/traditions/:id",
      content:
        "PUT: Update a tradition by ID. Body: any subset of tradition fields. DELETE: Permanently delete a tradition by ID.",
    },
    {
      title: "Categories — GET/POST /api/v1/categories",
      content:
        "GET: List all task categories (global config). POST: Create a category. Body (JSON): { key (required, slug), name (required), followUpQuestions (JSON string) }. Duplicate keys return 409 Conflict.",
    },
    {
      title: "Categories — PUT/DELETE /api/v1/categories/:id",
      content:
        "PUT: Update a category by ID. Body: any subset of category fields. DELETE: Permanently delete a category by ID.",
    },
    {
      title: "Example: List Traditions",
      content:
        "curl -X GET https://your-domain.com/api/v1/traditions -H 'x-api-key: wpa_your_key' | Lists all wedding traditions configured on the platform.",
    },
    {
      title: "Example: List Categories",
      content:
        "curl -X GET https://your-domain.com/api/v1/categories -H 'x-api-key: wpa_your_key' | Lists all task categories configured on the platform.",
    },
  ],
};

interface DocSection {
  id: string;
  title: string;
  icon: string;
  admin?: boolean;
  items: {
    title: string;
    content: string;
  }[];
}

const allSections: DocSection[] = [
  sections[0], // getting-started
  personasSection,
  sections[1], // wedding-ceremony-planner
  sections[2], // wedding-task-planner
  sections[3], // calendar
  sections[4], // catering-menu-planner
  sections[5], // guests
  sections[6], // vendors
  sections[7], // showcase
  sections[8], // profile
  sections[9], // admin
  sections[10], // traditions
  sections[11], // team
  apiSection,
];

function SectionCard({
  section,
}: {
  section: DocSection;
}) {
  return (
    <div id={section.id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{section.icon}</span>
        <h2 className="text-2xl font-bold text-[#2d336b] dark:text-slate-100">{section.title}</h2>
        {section.admin && (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            Admin
          </span>
        )}
      </div>
      <div className="space-y-4 mb-10">
        {section.items.map((item) => (
          <div
            key={item.title}
            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-sm transition-shadow"
          >
            <h3 className="font-semibold text-[#2d336b] dark:text-slate-100 text-base mb-2">
              {item.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-block px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-[#6771ab] dark:text-violet-300 text-xs font-bold uppercase tracking-widest mb-3">
          Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2d336b] dark:text-slate-100 mb-3">
          WedPlanAI User Guide
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-2xl">
          Everything you need to know about planning your perfect wedding with
          WedPlanAI — from the Event Creation Wizard to the REST API.
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-10 shadow-sm">
        <h2 className="font-bold text-[#2d336b] dark:text-slate-100 text-base mb-3">On this page</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {allSections.map((section) => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-[#6771ab] dark:hover:text-violet-300 transition-colors"
            >
              <span className="text-base">{section.icon}</span>
              <span>{section.title}</span>
              {section.admin && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  ADMIN
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Sections */}
      {allSections.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}

      {/* Footer note */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          Need help? Contact your wedding administrator or visit the{" "}
          <Link
            href="/dashboard/settings"
            className="text-[#6771ab] dark:text-violet-300 hover:underline font-medium"
          >
            Settings
          </Link>{" "}
          page for account support.
        </p>
      </div>
    </div>
  );
}
