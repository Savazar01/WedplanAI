import { getServerSession } from "@/lib/auth-server";
import Link from "next/link";
import { Cormorant_Infant } from "next/font/google";
import LandingNavbar from "@/components/landing/LandingNavbar";

const cormorant = Cormorant_Infant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export default async function LandingPage() {
  const session = await getServerSession();
  const isLoggedIn = !!(session && session.user);

  return (
    <div className={`${cormorant.variable} min-h-screen bg-[#faf5ff] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-300`}>
      {/* ─── NAVBAR ─── */}
      <LandingNavbar isLoggedIn={isLoggedIn} />

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        {/* Decorative gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-200/40 to-rose-200/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-200/30 to-violet-200/40 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-pink-100/20 via-violet-100/20 to-amber-100/20 blur-3xl" />
        </div>

        {/* Tradition badge */}
        <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          AI-Powered Wedding Planning
        </div>

        <h1
          className={`${cormorant.className} hero-gradient-text relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-clip-text bg-gradient-to-r from-[#6771ab] via-[#c484b0] to-amber-500 dark:from-[#8b93c5] dark:via-[#c484b0] dark:to-amber-400 leading-[1.4] mb-6 max-w-full px-4 pb-3`}
          style={{ WebkitTextFillColor: 'transparent', color: 'transparent' }}
        >
          Plan Your Perfect Wedding
        </h1>

        <p className="relative text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          From intimate ceremonies to grand celebrations — WedPlanAI gives your team every tool to orchestrate a flawless, unforgettable wedding experience.
        </p>

        <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-[#6771ab] text-white font-semibold text-lg shadow-lg hover:bg-[#566198] transition-all hover:shadow-xl active:scale-[0.97] cursor-pointer"
            >
              Open Your Dashboard
            </Link>
          ) : (
            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#6771ab] to-[#c484b0] text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-all hover:shadow-xl active:scale-[0.97] cursor-pointer"
            >
              Sign In
            </Link>
          )}
        </div>


        {/* Elegant gold divider */}
        <div className="relative flex items-center justify-center gap-4 mt-16 w-full">
          <div className="h-px flex-1 max-w-[200px] bg-gradient-to-r from-transparent to-amber-300/60" />
          <span className="text-amber-500 text-sm">✦ ✦ ✦</span>
          <div className="h-px flex-1 max-w-[200px] bg-gradient-to-l from-transparent to-amber-300/60" />
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-[#0f172a]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-violet-100 text-[#6771ab] text-xs font-bold uppercase tracking-widest mb-4">
              Everything You Need
            </div>
            <h2 className={`${cormorant.className} text-4xl sm:text-5xl font-bold text-[#2d336b] dark:text-slate-200 mb-4`}>
              A Complete Wedding Planning Suite
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
              Every feature your team needs — from the first task card to the last RSVP confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                ),
                title: "Wedding Task Planner",
                desc: "Drag-and-drop task management. Auto-seeds default ceremonies and tasks for Hindu, Muslim, Sikh, Christian, and Secular traditions, and includes a Categories Visual Checklist builder.",
                color: "from-violet-500/10 to-violet-50",
                border: "border-violet-100",
                iconBg: "bg-violet-100 text-[#6771ab]",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                ),
                title: "Calendar & Ceremony Planner",
                desc: "View all ceremonies in a beautiful month calendar grid or a day-of ceremony timeline. Never miss a ceremony with visual scheduling.",
                color: "from-rose-500/10 to-rose-50",
                border: "border-rose-100",
                iconBg: "bg-rose-100 text-[#c484b0]",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ),
                title: "Guest RSVP Management",
                desc: "Track every guest with unique login codes for self-service RSVP. Send ceremony-specific invitations and monitor attending/declined/pending counts per ceremony in real time.",
                color: "from-amber-500/10 to-amber-50",
                border: "border-amber-100",
                iconBg: "bg-amber-100 text-amber-700",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                ),
                title: "Vendor & Budget Tracker",
                desc: "Manage all vendors — catering, décor, photography, music — with contract values, paid amounts, and payment status. Dynamic currency based on your country.",
                color: "from-emerald-500/10 to-emerald-50",
                border: "border-emerald-100",
                iconBg: "bg-emerald-100 text-emerald-700",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                ),
                title: "Catering Menu Planner",
                desc: "Design food & beverage menus for ceremonies. Link them directly to catering tasks and view them right from your day-of timeline planner.",
                color: "from-amber-500/10 to-amber-50",
                border: "border-amber-100",
                iconBg: "bg-amber-100 text-amber-700",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                ),
                title: "Public Showcase Website",
                desc: "Every wedding gets a stunning public page with a live countdown, Wedding Program ceremonies timeline, and guest RSVP form. Share the link with your guests.",
                color: "from-sky-500/10 to-sky-50",
                border: "border-sky-100",
                iconBg: "bg-sky-100 text-sky-700",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ),
                title: "Multi-Couple Planner Mode",
                desc: "Invite coordinators and couples. Supports multi-couple Planner mode to manage multiple weddings with individual onboarding links and restricted client views.",
                color: "from-purple-500/10 to-purple-50",
                border: "border-purple-100",
                iconBg: "bg-purple-100 text-purple-700",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group bg-gradient-to-br ${feature.color} dark:from-slate-900/40 dark:to-slate-900/60 border ${feature.border} dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-default`}
              >
                <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-[#2d336b] text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-[#faf5ff] to-[#eef0f7] dark:from-[#0b0f19] dark:to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-[#c484b0] text-xs font-bold uppercase tracking-widest mb-4">
            Simple Setup
          </div>
          <h2 className={`${cormorant.className} text-4xl sm:text-5xl font-bold text-[#2d336b] mb-4`}>
            Up and Running in Minutes
          </h2>
          <p className="text-slate-500 mb-16 text-base leading-relaxed">
            No complex onboarding. No technical expertise required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line for desktop */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-[#6771ab]/30 via-[#c484b0]/50 to-[#6771ab]/30" />

            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Sign up in seconds. The first user automatically becomes the admin — no credit card needed.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                ),
              },
              {
                step: "02",
                title: "Set Up Your Wedding",
                desc: "Walk through our guided wizard: add partners' names, date, tradition, venue, and watch tasks auto-generate for your wedding style.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                ),
              },
              {
                step: "03",
                title: "Invite Your Team",
                desc: "Add wedding coordinators, family members, and vendors. Everyone collaborates in one place with role-based access.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                ),
              },
            ].map((step) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-2 border-[#6771ab]/30 shadow-md flex items-center justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6771ab] to-[#c484b0] flex items-center justify-center text-white shadow-sm">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-bold text-[#2d336b] text-lg mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── TRADITION SUPPORT ─── */}
      <section className="py-24 px-6 bg-[#faf5ff] dark:bg-[#0b0f19]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-violet-100 text-[#6771ab] text-xs font-bold uppercase tracking-widest mb-4">
            Culturally Inclusive
          </div>
          <h2 className={`${cormorant.className} text-4xl sm:text-5xl font-bold text-[#2d336b] mb-4`}>
            Every Tradition, Beautifully Supported
          </h2>
          <p className="text-slate-500 mb-12 max-w-2xl mx-auto text-base leading-relaxed">
            WedPlanAI pre-populates your tasks, ceremonies, and schedule based on your wedding tradition — so you start with a smart foundation, not a blank slate.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: "Hindu", icon: "🪔", sub: "Shubh Vivah" },
              { name: "Muslim", icon: "☪️", sub: "Nikah" },
              { name: "Sikh", icon: "✡️", sub: "Anand Karaj" },
              { name: "Christian", icon: "✝️", sub: "Holy Matrimony" },
              { name: "Secular", icon: "🌟", sub: "Celebration" },
            ].map((trad) => (
              <div
                key={trad.name}
                className="bg-white dark:bg-slate-900 border border-violet-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
              >
                <div className="text-3xl mb-2" role="img" aria-label={trad.name}>{trad.icon}</div>
                <div className="font-semibold text-[#2d336b] text-sm">{trad.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{trad.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── FOOTER ─── */}
      <footer className="bg-[#2d336b] dark:bg-[#111625] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-10">
            <div className="flex flex-col items-center md:items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://savazar.com/wp-content/uploads/2023/10/cropped-Transparent_Image_2-300x100.png"
                alt="Savazar"
                className="h-8 w-auto object-contain brightness-0 invert"
              />
              <p className="text-white/60 text-sm max-w-xs text-center md:text-left leading-relaxed">
                AI-powered wedding planning for every tradition, every family, every love story.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Product</div>
                <ul className="space-y-2 text-white/70">
                  <li><a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">How It Works</a></li>
                  <li><Link href="/dashboard/docs" className="hover:text-white transition-colors cursor-pointer">Docs</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Account</div>
                <ul className="space-y-2 text-white/70">
                  <li><Link href="/signup" className="hover:text-white transition-colors cursor-pointer">Sign Up</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors cursor-pointer">Sign In</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Company</div>
                <ul className="space-y-2 text-white/70">
                  <li><a href="https://savazar.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer">Savazar</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs">
            <span>© {new Date().getFullYear()} Savazar. All rights reserved.</span>
            <span>Crafted with love for extraordinary weddings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
