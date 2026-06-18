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
          "Visit the Sign Up page to register as the first admin. The first user to sign up is automatically designated as the administrator. If other users already exist, public registration closes and new users must be created by an admin via User Management.",
      },
      {
        title: "Sample Wedding",
        content:
          "When you sign up, a sample Hindu wedding (Rahul & Priya) is automatically created with pre-seeded tasks, rituals, guests, and vendors. This lets you explore the platform immediately. The sample wedding is read-only and cannot be deleted, but you can hide the walkthrough banner after reviewing it.",
      },
      {
        title: "Creating Your Wedding",
        content:
          "Use the guided 7-step wizard to set up your wedding: enter partner names, date and venue, select your tradition (Hindu, Muslim, Sikh, Christian, or Secular), set budget and guest count, and the system will auto-generate planning tasks, rituals, and itinerary events specific to your tradition.",
      },
      {
        title: "Dashboard Overview",
        content:
          "The main dashboard shows your active wedding at a glance: task completion percentage, guest RSVP breakdown (attending, declined, pending), budget status with breach alerts, and quick-access navigation to all features.",
      },
    ],
  },
  {
    id: "planning-board",
    title: "Planning Board",
    icon: "📋",
    items: [
      {
        title: "What It Is",
        content:
          "The Planning Board is a drag-and-drop kanban board for managing all your wedding tasks across four columns: Backlog, To-Do, In Progress, and Done. Tasks are pre-seeded based on your wedding tradition so you never start from a blank slate.",
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
          "The Calendar page displays all rituals, ceremonies, and tasks with due dates in a clean month-grid layout. Navigate between months using the prev/next arrows.",
      },
      {
        title: "Events",
        content:
          "Each ritual from your Event Itinerary appears as an event card on its scheduled date. Tasks with due dates are also shown. Click on any event to see details.",
      },
    ],
  },
  {
    id: "event-itinerary",
    title: "Event Itinerary",
    icon: "⏱️",
    items: [
      {
        title: "Day-of Timeline",
        content:
          "The Event Itinerary page shows all your wedding ceremonies and rituals in chronological order with precise timings. This is your wedding day run sheet — each ritual displays its name, date, time range, and location.",
      },
      {
        title: "Adding Rituals",
        content:
          "Click 'Add Ritual' to add a new ceremony or event to your itinerary. Provide the name, date, start time, end time, and location. Dates are formatted as DD-Month-YYYY (e.g., 26-June-2026).",
      },
      {
        title: "Editing Rituals",
        content:
          "Click the edit icon on any ritual to update its details — change the time, date, or location as your planning evolves.",
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
          "Use the CSV import feature to add hundreds of guests at once. Download the template, populate it with your guest data, and upload. The system will create guest entries and generate unique invitation codes for each.",
      },
      {
        title: "Guest Invitation Codes",
        content:
          "Each guest gets a unique invitation code. Click the 'Send' button next to any guest to generate their personal RSVP URL with the code pre-filled. Share this link via WhatsApp, email, or SMS.",
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
        title: "User Management",
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
          "Endpoints: GET/POST /api/v1/columns, /api/v1/guests, /api/v1/rituals, /api/v1/tasks, /api/v1/vendors, /api/v1/wedding. Individual resources can be accessed at /api/v1/[resource]/[id].",
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
          "WedPlanAI supports 5 wedding traditions: Hindu (Shubh Vivah), Muslim (Nikah), Sikh (Anand Karaj), Christian (Holy Matrimony), and Secular (Celebration). Each tradition comes with pre-seeded planning tasks, ceremonies, and rituals tailored to its customs.",
      },
      {
        title: "Auto-Seeding",
        content:
          "When you create a wedding via the wizard and select a tradition, the system automatically generates relevant tasks for your Planning Board (e.g., 'Book the mandap' for Hindu weddings) and populates the Event Itinerary with tradition-specific ceremonies.",
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
          "Invite wedding coordinators, family members, and planners to collaborate. Each team member gets secure access with role-based permissions. Admins can create user accounts via Admin > User Management.",
      },
      {
        title: "Role-Based Permissions",
        content:
          "Admin users have access to all features including admin panel (Appearance, API Keys, User Management). Regular users can access all planning features but cannot modify system settings.",
      },
    ],
  },
];

function SectionCard({
  section,
}: {
  section: (typeof sections)[number];
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
          {sections.map((section) => (
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
      {sections.map((section) => (
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
