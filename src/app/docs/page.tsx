import Link from "next/link";
import { getLocaleServer } from "@/lib/i18n-server";
import { translations } from "@/lib/translations";

const getSections = (t: (key: string) => string) => [
  {
    id: "getting-started",
    title: t("docs.sections.gettingStarted.title"),
    icon: "🚀",
    items: [
      {
        title: t("docs.sections.gettingStarted.items.account.title"),
        content:
          t("docs.sections.gettingStarted.items.account.content"),
      },
      {
        title: t("docs.sections.gettingStarted.items.sample.title"),
        content:
          t("docs.sections.gettingStarted.items.sample.contentPublic"),
      },
      {
        title: t("docs.sections.gettingStarted.items.wizard.title"),
        content:
          t("docs.sections.gettingStarted.items.wizard.contentPublic"),
      },
      {
        title: t("docs.sections.gettingStarted.items.seeding.title"),
        content:
          t("docs.sections.gettingStarted.items.seeding.content"),
      },
      {
        title: t("docs.sections.gettingStarted.items.archive.title"),
        content:
          t("docs.sections.gettingStarted.items.archive.content"),
      },
      {
        title: t("docs.sections.gettingStarted.items.dashboard.title"),
        content:
          t("docs.sections.gettingStarted.items.dashboard.contentPublic"),
      },
    ],
  },
  {
    id: "wedding-ceremony-planner",
    title: t("docs.sections.ceremonyPlanner.title"),
    icon: "⏱️",
    items: [
      {
        title: t("docs.sections.ceremonyPlanner.items.timeline.title"),
        content:
          t("docs.sections.ceremonyPlanner.items.timeline.content"),
      },
      {
        title: t("docs.sections.ceremonyPlanner.items.add.title"),
        content:
          t("docs.sections.ceremonyPlanner.items.add.content"),
      },
      {
        title: t("docs.sections.ceremonyPlanner.items.edit.title"),
        content:
          t("docs.sections.ceremonyPlanner.items.edit.content"),
      },
      {
        title: t("docs.sections.ceremonyPlanner.items.food.title"),
        content:
          t("docs.sections.ceremonyPlanner.items.food.content"),
      },
    ],
  },
  {
    id: "wedding-task-planner",
    title: t("docs.sections.taskPlanner.title"),
    icon: "📋",
    items: [
      {
        title: t("docs.sections.taskPlanner.items.what.title"),
        content:
          t("docs.sections.taskPlanner.items.what.content"),
      },
      {
        title: t("docs.sections.taskPlanner.items.add.title"),
        content:
          t("docs.sections.taskPlanner.items.add.content"),
      },
      {
        title: t("docs.sections.taskPlanner.items.drag.title"),
        content:
          t("docs.sections.taskPlanner.items.drag.content"),
      },
      {
        title: t("docs.sections.taskPlanner.items.edit.title"),
        content:
          t("docs.sections.taskPlanner.items.edit.content"),
      },
      {
        title: t("docs.sections.taskPlanner.items.categories.title"),
        content:
          t("docs.sections.taskPlanner.items.categories.content"),
      },
    ],
  },
  {
    id: "calendar",
    title: t("docs.sections.calendar.title"),
    icon: "📅",
    items: [
      {
        title: t("docs.sections.calendar.items.monthly.title"),
        content:
          t("docs.sections.calendar.items.monthly.content"),
      },
      {
        title: t("docs.sections.calendar.items.events.title"),
        content:
          t("docs.sections.calendar.items.events.content"),
      },
    ],
  },
  {
    id: "catering-menu-planner",
    title: t("docs.sections.catering.title"),
    icon: "🍴",
    items: [
      {
        title: t("docs.sections.catering.items.overview.title"),
        content:
          t("docs.sections.catering.items.overview.content"),
      },
      {
        title: t("docs.sections.catering.items.plan.title"),
        content:
          t("docs.sections.catering.items.plan.content"),
      },
      {
        title: t("docs.sections.catering.items.link.title"),
        content:
          t("docs.sections.catering.items.link.content"),
      },
      {
        title: t("docs.sections.catering.items.timeline.title"),
        content:
          t("docs.sections.catering.items.timeline.content"),
      },
    ],
  },
  {
    id: "guests",
    title: t("docs.sections.guests.title"),
    icon: "👥",
    items: [
      {
        title: t("docs.sections.guests.items.list.title"),
        content:
          t("docs.sections.guests.items.list.content"),
      },
      {
        title: t("docs.sections.guests.items.add.title"),
        content:
          t("docs.sections.guests.items.add.content"),
      },
      {
        title: t("docs.sections.guests.items.csv.title"),
        content:
          t("docs.sections.guests.items.csv.content"),
      },
      {
        title: t("docs.sections.guests.items.send.title"),
        content:
          t("docs.sections.guests.items.send.content"),
      },
      {
        title: t("docs.sections.guests.items.tracking.title"),
        content:
          t("docs.sections.guests.items.tracking.content"),
      },
    ],
  },
  {
    id: "vendors",
    title: t("docs.sections.vendors.title"),
    icon: "🏪",
    items: [
      {
        title: t("docs.sections.vendors.items.manage.title"),
        content:
          t("docs.sections.vendors.items.manage.content"),
      },
      {
        title: t("docs.sections.vendors.items.budget.title"),
        content:
          t("docs.sections.vendors.items.budget.contentPublic"),
      },
      {
        title: t("docs.sections.vendors.items.breach.title"),
        content:
          t("docs.sections.vendors.items.breach.content"),
      },
    ],
  },
  {
    id: "showcase",
    title: t("docs.sections.showcase.title"),
    icon: "🌐",
    items: [
      {
        title: t("docs.sections.showcase.items.public.title"),
        content:
          t("docs.sections.showcase.items.public.content"),
      },
      {
        title: t("docs.sections.showcase.items.build.title"),
        content:
          t("docs.sections.showcase.items.build.contentPublic"),
      },
      {
        title: t("docs.sections.showcase.items.share.title"),
        content:
          t("docs.sections.showcase.items.share.content"),
      },
      {
        title: t("docs.sections.showcase.items.gift.title"),
        content:
          t("docs.sections.showcase.items.gift.content"),
      },
      {
        title: t("docs.sections.showcase.items.program.title"),
        content:
          t("docs.sections.showcase.items.program.content"),
      },
    ],
  },
  {
    id: "profile",
    title: t("docs.sections.profile.title"),
    icon: "⚙️",
    items: [
      {
        title: t("docs.sections.profile.items.manage.title"),
        content:
          t("docs.sections.profile.items.manage.content"),
      },
      {
        title: t("docs.sections.profile.items.password.title"),
        content:
          t("docs.sections.profile.items.password.content"),
      },
      {
        title: t("docs.sections.profile.items.info.title"),
        content:
          t("docs.sections.profile.items.info.content"),
      },
    ],
  },
  {
    id: "admin",
    title: t("docs.sections.admin.title"),
    icon: "🛡️",
    admin: true,
    items: [
      {
        title: t("docs.sections.admin.items.appearance.title"),
        content:
          t("docs.sections.admin.items.appearance.content"),
      },
      {
        title: t("docs.sections.admin.items.traditions.title"),
        content:
          t("docs.sections.admin.items.traditions.content"),
      },
      {
        title: t("docs.sections.admin.items.categories.title"),
        content:
          t("docs.sections.admin.items.categories.content"),
      },
      {
        title: t("docs.sections.admin.items.api.title"),
        content:
          t("docs.sections.admin.items.api.contentPublic"),
      },
      {
        title: t("docs.sections.admin.items.team.title"),
        content:
          t("docs.sections.admin.items.team.content"),
      },
    ],
  },
  {
    id: "traditions",
    title: t("docs.sections.traditions.title"),
    icon: "🌟",
    items: [
      {
        title: t("docs.sections.traditions.items.builtin.title"),
        content:
          t("docs.sections.traditions.items.builtin.content"),
      },
      {
        title: t("docs.sections.traditions.items.custom.title"),
        content:
          t("docs.sections.traditions.items.custom.content"),
      },
      {
        title: t("docs.sections.traditions.items.autoseed.title"),
        content:
          t("docs.sections.traditions.items.autoseed.content"),
      },
    ],
  },
  {
    id: "team",
    title: t("docs.sections.team.title"),
    icon: "🤝",
    items: [
      {
        title: t("docs.sections.team.items.multiuser.title"),
        content:
          t("docs.sections.team.items.multiuser.content"),
      },
      {
        title: t("docs.sections.team.items.roles.title"),
        content:
          t("docs.sections.team.items.roles.content"),
      },
      {
        title: t("docs.sections.team.items.onboard.title"),
        content:
          t("docs.sections.team.items.onboard.content"),
      },
    ],
  },
];

const getPersonasSection = (t: (key: string) => string) => ({
  id: "personas",
  title: t("docs.sections.personas.title"),
  icon: "👥",
  items: [
    {
      title: t("docs.sections.personas.items.planner.title"),
      content:
        t("docs.sections.personas.items.planner.content"),
    },
    {
      title: t("docs.sections.personas.items.diy.title"),
      content:
        t("docs.sections.personas.items.diy.content"),
    },
    {
      title: t("docs.sections.personas.items.client.title"),
      content:
        t("docs.sections.personas.items.client.content"),
    },
    {
      title: t("docs.sections.personas.items.manage.title"),
      content:
        t("docs.sections.personas.items.manage.content"),
    },
  ],
});

const getApiSection = (t: (key: string) => string) => ({
  id: "api",
  title: t("docs.sections.api.title"),
  icon: "🔌",
  admin: true,
  items: [
    {
      title: t("docs.sections.api.items.overview.title"),
      content:
        t("docs.sections.api.items.overview.contentPublic"),
    },
    {
      title: t("docs.sections.api.items.getWedding.title"),
      content:
        t("docs.sections.api.items.getWedding.content"),
    },
    {
      title: t("docs.sections.api.items.putWedding.title"),
      content:
        t("docs.sections.api.items.putWedding.content"),
    },
    {
      title: t("docs.sections.api.items.postCeremony.title"),
      content:
        t("docs.sections.api.items.postCeremony.content"),
    },
    {
      title: t("docs.sections.api.items.putCeremony.title"),
      content:
        t("docs.sections.api.items.putCeremony.content"),
    },
    {
      title: t("docs.sections.api.items.postTask.title"),
      content:
        t("docs.sections.api.items.postTask.content"),
    },
    {
      title: t("docs.sections.api.items.putTask.title"),
      content:
        t("docs.sections.api.items.putTask.content"),
    },
    {
      title: t("docs.sections.api.items.postGuest.title"),
      content:
        t("docs.sections.api.items.postGuest.content"),
    },
    {
      title: t("docs.sections.api.items.putGuest.title"),
      content:
        t("docs.sections.api.items.putGuest.content"),
    },
    {
      title: t("docs.sections.api.items.postVendor.title"),
      content:
        t("docs.sections.api.items.postVendor.content"),
    },
    {
      title: t("docs.sections.api.items.putVendor.title"),
      content:
        t("docs.sections.api.items.putVendor.content"),
    },
    {
      title: t("docs.sections.api.items.postColumn.title"),
      content:
        t("docs.sections.api.items.postColumn.content"),
    },
    {
      title: t("docs.sections.api.items.putColumn.title"),
      content:
        t("docs.sections.api.items.putColumn.content"),
    },
    {
      title: t("docs.sections.api.items.exCeremony.title"),
      content:
        t("docs.sections.api.items.exCeremony.content"),
    },
    {
      title: t("docs.sections.api.items.exTask.title"),
      content:
        t("docs.sections.api.items.exTask.content"),
    },
    {
      title: t("docs.sections.api.items.postTradition.title"),
      content:
        t("docs.sections.api.items.postTradition.content"),
    },
    {
      title: t("docs.sections.api.items.putTradition.title"),
      content:
        t("docs.sections.api.items.putTradition.content"),
    },
    {
      title: t("docs.sections.api.items.postCategory.title"),
      content:
        t("docs.sections.api.items.postCategory.content"),
    },
    {
      title: t("docs.sections.api.items.putCategory.title"),
      content:
        t("docs.sections.api.items.putCategory.content"),
    },
    {
      title: t("docs.sections.api.items.exTradition.title"),
      content:
        t("docs.sections.api.items.exTradition.content"),
    },
    {
      title: t("docs.sections.api.items.exCategory.title"),
      content:
        t("docs.sections.api.items.exCategory.content"),
    },
  ],
});

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

const getAllSections = (t: (key: string) => string): DocSection[] => [
  getSections(t)[0], // getting-started
  getPersonasSection(t),
  getSections(t)[1], // wedding-ceremony-planner
  getSections(t)[2], // wedding-task-planner
  getSections(t)[3], // calendar
  getSections(t)[4], // catering-menu-planner
  getSections(t)[5], // guests
  getSections(t)[6], // vendors
  getSections(t)[7], // showcase
  getSections(t)[8], // profile
  getSections(t)[9], // admin
  getSections(t)[10], // traditions
  getSections(t)[11], // team
  getApiSection(t),
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

export default async function DocsPage() {
  const locale = await getLocaleServer();
  const t = (key: string) => (translations[locale as keyof typeof translations] as Record<string, string>)?.[key] || (translations["en"] as Record<string, string>)[key];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-block px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-[#6771ab] dark:text-violet-300 text-xs font-bold uppercase tracking-widest mb-3">
          Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2d336b] dark:text-slate-100 mb-3">
          {t("docs.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-2xl">
          {t("docs.subtitle")}
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-10 shadow-sm">
        <h2 className="font-bold text-[#2d336b] dark:text-slate-100 text-base mb-3">{t("docs.onThisPage")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {getAllSections(t).map((section) => (
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
      {getAllSections(t).map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}

      {/* Footer note */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          {t("docs.needHelp")}{" "}
          <Link
            href="/dashboard/settings"
            className="text-[#6771ab] dark:text-violet-300 hover:underline font-medium"
          >
            Settings
          </Link>{" "}
          {t("docs.pageForSupport")}
        </p>
      </div>
    </div>
  );
}
