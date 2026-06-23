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
          "When you sign up, a sample Hindu wedding (Rahul & Priya) is automatically created with pre-seeded tasks, ceremonies, guests, and vendors. This lets you explore the platform immediately. The sample wedding is read-only and cannot be deleted, but you can hide the walkthrough banner after reviewing it.",
      },
      {
        title: "Creating Your Wedding",
        content:
          "Use the guided 7-step wizard to set up your wedding: enter partner names, date and venue, select your tradition (Hindu, Muslim, Sikh, Christian, or Secular), set budget and guest count, and the system will auto-generate planning tasks and ceremonies specific to your tradition.",
      },
      {
        title: "Dashboard Overview",
        content:
          "The main dashboard shows your active wedding at a glance: task completion percentage (with To-Do, In Progress, Done, and Overdue counts), guest RSVP breakdown (attending, declined, pending — broken down per ceremony), budget status with color-coded depletion bar and breach alerts, and a Build Showcase Page quick-navigation button. The Guests section provides personal invitation links — each link has a separate 'Copy Link' button (to copy the URL) and a 'Save Ceremonies' button (to persist which ceremonies the guest is invited to).",
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
          "Click the 'Add Task' button at the top of any column to create a new task. Give it a title, description, assign it to a team member, and set a due date. Tasks can be moved between columns by dragging.",
      },
      {
        title: "Drag & Drop",
        content:
          "Simply click and drag any task card to another column to update its status. The board auto-saves the new position.",
      },
      {
        title: "Editing & Deleting",
        content:
          "Click on any task card to open a detail dialog where you can edit the title, description, assignee, or due date. Use the delete option to remove a task permanently.",
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
    id: "wedding-ceremony-planner",
    title: "Wedding Ceremony Planner",
    icon: "⏱️",
    items: [
      {
        title: "Day-of Timeline",
        content:
          "The Wedding Ceremony Planner page shows all your wedding ceremonies in chronological order with precise timings. This is your wedding day run sheet — each ceremony displays its name, date, time range, and location.",
      },
      {
        title: "Adding Ceremonies",
        content:
          "Click 'Add Ceremony' to add a new ceremony. Provide the name, date, start time, end time, location, dress code, whether food is served, and an optional assignee. You can also add checklist items to each ceremony to track preparation tasks.",
      },
      {
        title: "Editing Ceremonies",
        content:
          "Click the edit icon on any ceremony to update its details — change the time, date, dress code, location, or assignee as your planning evolves.",
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
        title: "Guest Invitation Codes",
        content:
          "Each guest gets a unique invitation code. Click the 'Send' button next to any guest to open the invitation dialog. Select the ceremonies this guest is invited to, then click 'Save Ceremonies' to persist their ceremony assignments. Use the 'Copy Link' button to copy their personal RSVP URL — share it via WhatsApp, SMS, or email. When a guest opens their personal link, the Wedding Program on the public showcase page automatically filters to show only their invited ceremonies.",
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
          "For each vendor, record the contract amount, amount already paid, and currency. The system automatically calculates the outstanding balance. Currency is dynamically set based on your wedding's country.",
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
          "Every wedding gets a beautiful public showcase page at /wedding/[id]. This page features a live countdown, ceremony itinerary timeline, welcome story, hero image, and an embedded RSVP form for guests.",
      },
      {
        title: "Building Your Showcase",
        content:
          "Navigate to Build Showcase Page from the sidebar (admin only). Customize the hero banner image, welcome text, couple's story, and RSVP form title and description. The page updates in real-time as you make changes.",
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
          "The User Profile page lets you edit your name, address, country, and spoken languages. Your country selection affects currency formatting throughout the app.",
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
    title: "Admin Features",
    icon: "🛡️",
    admin: true,
    items: [
      {
        title: "Appearance",
        content:
          "Customize your wedding's visual theme: choose fonts, primary and secondary colors, background colors, and upload a custom logo. Changes apply to the dashboard and showcase page.",
      },
      {
        title: "API Keys",
        content:
          "Create and manage API keys for programmatic access to your wedding data via the REST API v1 endpoints. Each key can be labeled and revoked individually.",
      },
      {
        title: "Manage Your Team",
        content:
          "View all registered users in the system. Create new user accounts when public registration is closed. Each user can be assigned a role (admin or user).",
      },
    ],
  },
  {
    id: "api",
    title: "REST API v1",
    icon: "🔌",
    admin: true,
    items: [
      {
        title: "API Overview",
        content:
          "WedPlanAI exposes a REST API v1 at /api/v1/ for programmatic access to your wedding data. All endpoints require authentication via API keys (managed in Admin > API Keys).",
      },
      {
        title: "Available Endpoints",
        content:
          "Endpoints: GET/POST /api/v1/columns, /api/v1/guests, /api/v1/ceremonies, /api/v1/tasks, /api/v1/vendors, /api/v1/wedding. Individual resources can be accessed at /api/v1/[resource]/[id].",
      },
    ],
  },
  {
    id: "traditions",
    title: "Tradition Support",
    icon: "🌟",
    items: [
      {
        title: "Supported Traditions",
        content:
          "WedPlanAI supports 5 wedding traditions: Hindu (Shubh Vivah), Muslim (Nikah), Sikh (Anand Karaj), Christian (Holy Matrimony), and Secular (Celebration). Each tradition comes with pre-seeded planning tasks and ceremonies tailored to its customs.",
      },
      {
        title: "Auto-Seeding",
        content:
          "When you create a wedding via the wizard and select a tradition, the system automatically generates relevant tasks for your Wedding Task Planner (e.g., 'Book the mandap' for Hindu weddings) and populates the Wedding Ceremony Planner with tradition-specific ceremonies.",
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
          "Admin users have access to all features including admin panel (Appearance, API Keys, Manage Your Team). Regular users can access all planning features but cannot modify system settings.",
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

const weddingProgramSection = {
  id: "wedding-program",
  title: "Wedding Program",
  icon: "🎊",
  items: [
    {
      title: "Public Showcase Page",
      content:
        "Your wedding has a public showcase page at /wedding/[id] showing countdown, Wedding Program (ceremonies), story, RSVP form, and gift registry.",
    },
    {
      title: "Wedding Program (Filtered View)",
      content:
        "When a guest opens their personal invitation link, the Wedding Program on the showcase page automatically filters to show only the ceremonies they are invited to — so each guest sees a personalized program.",
    },
  ],
};

const adminConfigSection = {
  id: "admin-config",
  title: "Admin Configuration",
  icon: "⚙️",
  admin: true,
  items: [
    {
      title: "Traditions Admin",
      content:
        "Manage the wedding traditions available on the platform at /dashboard/admin/traditions. Add custom traditions or disable unused ones.",
    },
    {
      title: "Categories Admin",
      content:
        "Manage task categories and their follow-up questions at /dashboard/admin/categories. Use the visual checklist builder to define questions — choose a label and answer type (Text, Yes/No, Number) for each. Questions appear when a planner creates a task in that category.",
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
  ...sections.slice(0, 1),
  personasSection,
  ...sections.slice(1),
  weddingProgramSection,
  adminConfigSection,
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
        <h2 className="text-2xl font-bold text-[#2d336b]">{section.title}</h2>
        {section.admin && (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            Admin
          </span>
        )}
      </div>
      <div className="space-y-4 mb-10">
        {section.items.map((item) => (
          <div
            key={item.title}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
          >
            <h3 className="font-semibold text-[#2d336b] text-base mb-2">
              {item.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
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
        <div className="inline-block px-3 py-1 rounded-full bg-violet-100 text-[#6771ab] text-xs font-bold uppercase tracking-widest mb-3">
          Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2d336b] mb-3">
          WedPlanAI User Guide
        </h1>
        <p className="text-slate-500 text-base leading-relaxed max-w-2xl">
          Everything you need to know about planning your perfect wedding with
          WedPlanAI. From creating your account to sharing your showcase page.
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-10 shadow-sm">
        <h2 className="font-bold text-[#2d336b] text-base mb-3">On this page</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {allSections.map((section) => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-violet-50 hover:text-[#6771ab] transition-colors"
            >
              <span className="text-base">{section.icon}</span>
              <span>{section.title}</span>
              {section.admin && (
                <span className="text-[10px] text-amber-600 font-semibold">
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
      <div className="border-t border-slate-200 pt-8 mt-8 text-center">
        <p className="text-slate-400 text-sm">
          Need help? Contact your wedding administrator or visit the{" "}
          <Link
            href="/dashboard/settings"
            className="text-[#6771ab] hover:underline font-medium"
          >
            Settings
          </Link>{" "}
          page for account support.
        </p>
      </div>
    </div>
  );
}
