"use client";

import * as React from "react";
import Link from "next/link";
import { Cormorant_Infant } from "next/font/google";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const cormorant = Cormorant_Infant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const featureCardBase = "group bg-gradient-to-br border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-default";

const FeatureIcon = ({ children, bg }: { children: React.ReactNode; bg: string }) => (
  <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
    {children}
  </div>
);

export default function LandingContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t } = useTranslation();

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-200/40 to-rose-200/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-200/30 to-violet-200/40 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-pink-100/20 via-violet-100/20 to-amber-100/20 blur-3xl" />
        </div>

        <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          {t("landing.hero.subtitle")}
        </div>

        <h1
          className={`${cormorant.className} hero-gradient-text relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-clip-text bg-gradient-to-r from-[#6771ab] via-[#c484b0] to-amber-500 dark:from-[#8b93c5] dark:via-[#c484b0] dark:to-amber-400 leading-[1.4] mb-6 max-w-full px-4 pb-3`}
          style={{ WebkitTextFillColor: 'transparent', color: 'transparent' }}
        >
          {t("landing.hero.title")}
        </h1>

        <p className="relative text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          {t("landing.hero.description")}
        </p>

        <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-[#6771ab] text-white font-semibold text-lg shadow-lg hover:bg-[#566198] transition-all hover:shadow-xl active:scale-[0.97] cursor-pointer"
            >
              {t("landing.hero.ctaOpenDashboard")}
            </Link>
          ) : (
            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#6771ab] to-[#c484b0] text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-all hover:shadow-xl active:scale-[0.97] cursor-pointer"
            >
              {t("landing.hero.ctaSignIn")}
            </Link>
          )}
        </div>

        <div className="relative flex items-center justify-center gap-4 mt-16 w-full">
          <div className="h-px flex-1 max-w-[200px] bg-gradient-to-r from-transparent to-amber-300/60" />
          <span className="text-amber-500 text-sm">✦ ✦ ✦</span>
          <div className="h-px flex-1 max-w-[200px] bg-gradient-to-l from-transparent to-amber-300/60" />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-[#0f172a]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-violet-100 text-[#6771ab] text-xs font-bold uppercase tracking-widest mb-4">
              {t("landing.features.sectionSub")}
            </div>
            <h2 className={`${cormorant.className} text-4xl sm:text-5xl font-bold text-[#2d336b] dark:text-slate-200 mb-4`}>
              {t("landing.features.sectionTitle")}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
              {t("landing.features.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`${featureCardBase} from-violet-500/10 to-violet-50 dark:from-slate-900/40 dark:to-slate-900/60 border-violet-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-violet-100 text-[#6771ab] dark:bg-violet-900/50 dark:text-violet-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.taskPlannerTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.taskPlannerDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-orange-500/10 to-orange-50 dark:from-slate-900/40 dark:to-slate-900/60 border-orange-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.ceremonyPlannerTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.ceremonyPlannerDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-rose-500/10 to-rose-50 dark:from-slate-900/40 dark:to-slate-900/60 border-rose-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-rose-100 text-[#c484b0] dark:bg-rose-900/50 dark:text-rose-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.calendarTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.calendarDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-teal-500/10 to-teal-50 dark:from-slate-900/40 dark:to-slate-900/60 border-teal-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.wizardTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.wizardDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-amber-500/10 to-amber-50 dark:from-slate-900/40 dark:to-slate-900/60 border-amber-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.rsvpTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.rsvpDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-indigo-500/10 to-indigo-50 dark:from-slate-900/40 dark:to-slate-900/60 border-indigo-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 10.742l8.99-4.495m0 0l-8.99-4.495m8.99 4.495v10m-8.99-5.505l8.99 4.495m0 0l-8.99 4.495m8.99-4.495v-10" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.sharingTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.sharingDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-emerald-500/10 to-emerald-50 dark:from-slate-900/40 dark:to-slate-900/60 border-emerald-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.budgetTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.budgetDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-amber-500/10 to-amber-50 dark:from-slate-900/40 dark:to-slate-900/60 border-amber-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.cateringTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.cateringDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-sky-500/10 to-sky-50 dark:from-slate-900/40 dark:to-slate-900/60 border-sky-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.showcaseTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.showcaseDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-purple-500/10 to-purple-50 dark:from-slate-900/40 dark:to-slate-900/60 border-purple-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.multiCoupleTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.multiCoupleDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-blue-500/10 to-blue-50 dark:from-slate-900/40 dark:to-slate-900/60 border-blue-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 100-18.008 9.004 9.004 0 000 18.008zm0 0V3m0 18c-2.505 0-4.582-4.03-4.582-9S9.495 3 12 3m0 18c2.505 0 4.582 4.03 4.582 9s-2.077 9-4.582 9zM3 12h18" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.i18nTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.i18nDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-pink-500/10 to-pink-50 dark:from-slate-900/40 dark:to-slate-900/60 border-pink-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.emailTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.emailDesc")}</p>
            </div>


            <div className={`${featureCardBase} from-red-500/10 to-red-50 dark:from-slate-900/40 dark:to-slate-900/60 border-red-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-1.305 1.797l-.272 1.357a.75.75 0 00.916.85l1.393-.348a3 3 0 001.782-1.307l5.517-5.517a1.42 1.42 0 00-2.008-2.008L9.53 16.122z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.43 12.985l2.229 2.228m-1.414-4.43a6 6 0 118.485-8.486 6 6 0 01-8.485 8.486z" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.templatesTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.templatesDesc")}</p>
            </div>

            <div className={`${featureCardBase} from-cyan-500/10 to-cyan-50 dark:from-slate-900/40 dark:to-slate-900/60 border-cyan-100 dark:border-slate-800`}>
              <FeatureIcon bg="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
              </FeatureIcon>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.features.mcpTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.features.mcpDesc")}</p>
            </div>
          </div>

          <div className="mt-20 pt-16 border-t border-violet-100 dark:border-slate-800">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
                {t("landing.admin.sectionSub")}
              </div>
              <h3 className={`${cormorant.className} text-3xl sm:text-4xl font-bold text-[#2d336b] dark:text-slate-200 mb-3`}>
                {t("landing.admin.sectionTitle")}
              </h3>
              <p className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
                {t("landing.admin.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className={`${featureCardBase} from-indigo-500/5 to-indigo-50/50 dark:from-slate-900/40 dark:to-slate-900/60 border-indigo-100 dark:border-slate-800`}>
                <FeatureIcon bg="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 013.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072" /></svg>
                </FeatureIcon>
                <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-base mb-2">{t("landing.admin.appearanceTitle")}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.admin.appearanceDesc")}</p>
              </div>

              <div className={`${featureCardBase} from-violet-500/5 to-violet-50/50 dark:from-slate-900/40 dark:to-slate-900/60 border-violet-100 dark:border-slate-800`}>
                <FeatureIcon bg="bg-violet-100 text-[#6771ab] dark:bg-violet-900/50 dark:text-violet-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </FeatureIcon>
                <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-base mb-2">{t("landing.admin.traditionsTitle")}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.admin.traditionsDesc")}</p>
              </div>

              <div className={`${featureCardBase} from-cyan-500/5 to-cyan-50/50 dark:from-slate-900/40 dark:to-slate-900/60 border-cyan-100 dark:border-slate-800`}>
                <FeatureIcon bg="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
                </FeatureIcon>
                <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-base mb-2">{t("landing.admin.categoriesTitle")}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.admin.categoriesDesc")}</p>
              </div>

              <div className={`${featureCardBase} from-slate-500/5 to-slate-50/50 dark:from-slate-900/40 dark:to-slate-900/60 border-slate-200 dark:border-slate-800`}>
                <FeatureIcon bg="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                </FeatureIcon>
                <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-base mb-2">{t("landing.admin.apiTitle")}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.admin.apiDesc")}</p>
              </div>

              <div className={`${featureCardBase} from-amber-500/5 to-amber-50/50 dark:from-slate-900/40 dark:to-slate-900/60 border-amber-100 dark:border-slate-800`}>
                <FeatureIcon bg="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V10.125m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>
                </FeatureIcon>
                <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-base mb-2">{t("landing.admin.r2Title")}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.admin.r2Desc")}</p>
              </div>

              <div className={`${featureCardBase} from-emerald-500/5 to-emerald-50/50 dark:from-slate-900/40 dark:to-slate-900/60 border-emerald-100 dark:border-slate-800`}>
                <FeatureIcon bg="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.446.54 1.08.311 1.637l-.894 2.156c-.149.358.125.753.51.713l2.846-.297a1.124 1.124 0 01.834.27 8.19 8.19 0 003.12.637z" /></svg>
                </FeatureIcon>
                <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-base mb-2">{t("landing.admin.whatsappTitle")}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.admin.whatsappDesc")}</p>
              </div>

              <div className={`${featureCardBase} from-rose-500/5 to-rose-50/50 dark:from-slate-900/40 dark:to-slate-900/60 border-rose-100 dark:border-slate-800`}>
                <FeatureIcon bg="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </FeatureIcon>
                <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-base mb-2">{t("landing.admin.ocrTitle")}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.admin.ocrDesc")}</p>
              </div>

              <div className={`${featureCardBase} from-purple-500/5 to-purple-50/50 dark:from-slate-900/40 dark:to-slate-900/60 border-purple-100 dark:border-slate-800`}>
                <FeatureIcon bg="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="9" y="9" width="6" height="6" />
                    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
                  </svg>
                </FeatureIcon>
                <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-base mb-2">{t("landing.admin.aiTitle")}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t("landing.admin.aiDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PERSONAS ─── */}
      <section id="personas" className="py-24 px-6 bg-[#faf5ff] dark:bg-[#0b0f19]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-xs font-bold uppercase tracking-widest mb-4">
              {t("landing.personas.sectionSub")}
            </div>
            <h2 className={`${cormorant.className} text-4xl sm:text-5xl font-bold text-[#2d336b] dark:text-slate-200 mb-4`}>
              {t("landing.personas.sectionTitle")}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
              {t("landing.personas.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-900/50 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6771ab] to-[#c484b0] flex items-center justify-center text-white shadow-md">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m-9.5 3.346c-.634.1-1.267.19-1.9.29C3.618 8.69 2.85 9.624 2.85 10.706v1.582a2.18 2.18 0 00.75 1.661m0 0l.443-.106m-5.193-1.448l.443-.106m.75 1.061l.443-.106M16.5 7.5V5.25c0-1.5-1.125-2.25-2.25-2.25h-4.5c-1.125 0-2.25.75-2.25 2.25V7.5" /></svg>
                </div>
                <div>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-[#6771ab]/10 text-[#6771ab] text-[10px] font-bold uppercase tracking-widest mb-1">{t("landing.personas.plannerTag")}</div>
                  <h3 className="text-xl font-bold text-[#2d336b] dark:text-slate-200">{t("landing.personas.plannerTitle")}</h3>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  t("landing.personas.plannerBullet1"),
                  t("landing.personas.plannerBullet2"),
                  t("landing.personas.plannerBullet3"),
                  t("landing.personas.plannerBullet4"),
                  t("landing.personas.plannerBullet5"),
                  t("landing.personas.plannerBullet6"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-md">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                </div>
                <div>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest mb-1">{t("landing.personas.coupleTag")}</div>
                  <h3 className="text-xl font-bold text-[#2d336b] dark:text-slate-200">{t("landing.personas.coupleTitle")}</h3>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  t("landing.personas.coupleBullet1"),
                  t("landing.personas.coupleBullet2"),
                  t("landing.personas.coupleBullet3"),
                  t("landing.personas.coupleBullet4"),
                  t("landing.personas.coupleBullet5"),
                  t("landing.personas.coupleBullet6"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-[#faf5ff] to-[#eef0f7] dark:from-[#0b0f19] dark:to-slate-900">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-[#c484b0] dark:bg-rose-900/50 dark:text-rose-300 text-xs font-bold uppercase tracking-widest mb-4">
            {t("landing.howItWorks.sectionSub")}
          </div>
          <h2 className={`${cormorant.className} text-4xl sm:text-5xl font-bold text-[#2d336b] dark:text-slate-200 mb-4`}>
            {t("landing.howItWorks.sectionTitle")}
          </h2>
          <p className="text-slate-500 mb-16 text-base leading-relaxed max-w-2xl mx-auto">
            {t("landing.howItWorks.description")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#6771ab]/30 via-[#c484b0]/50 to-[#6771ab]/30" />

            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-2 border-[#6771ab]/30 shadow-md flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6771ab] to-[#c484b0] flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">01</span>
              </div>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.howItWorks.step1Title")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{t("landing.howItWorks.step1Desc")}</p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-2 border-[#6771ab]/30 shadow-md flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6771ab] to-[#c484b0] flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">02</span>
              </div>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.howItWorks.step2Title")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{t("landing.howItWorks.step2Desc")}</p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-2 border-[#6771ab]/30 shadow-md flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6771ab] to-[#c484b0] flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">03</span>
              </div>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.howItWorks.step3Title")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{t("landing.howItWorks.step3Desc")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-16">
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#6771ab]/30 via-[#c484b0]/50 to-[#6771ab]/30" />

            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-2 border-[#6771ab]/30 shadow-md flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6771ab] to-[#c484b0] flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">04</span>
              </div>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.howItWorks.step4Title")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{t("landing.howItWorks.step4Desc")}</p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-2 border-[#6771ab]/30 shadow-md flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6771ab] to-[#c484b0] flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">05</span>
              </div>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.howItWorks.step5Title")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{t("landing.howItWorks.step5Desc")}</p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-2 border-[#6771ab]/30 shadow-md flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6771ab] to-[#c484b0] flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">06</span>
              </div>
              <h3 className="font-bold text-[#2d336b] dark:text-slate-200 text-lg mb-2">{t("landing.howItWorks.step6Title")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{t("landing.howItWorks.step6Desc")}</p>
            </div>
          </div>

          <div className="mt-16 inline-flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl px-8 py-6 shadow-md">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 text-lg">✦</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#6771ab] dark:text-violet-300">{t("landing.howItWorks.helpTitle")}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {t("landing.howItWorks.helpDesc")}
              </p>
            </div>
            <a
              href="https://savazar.com/contact"
              target="_blank" rel="noopener noreferrer"
              className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6771ab] to-[#c484b0] text-white text-sm font-semibold shadow-md hover:opacity-90 transition-all hover:shadow-lg active:scale-[0.97] cursor-pointer"
            >
              {t("landing.howItWorks.helpCta")}
            </a>
          </div>
        </div>
      </section>

      {/* ─── TRADITIONS ─── */}
      <section className="py-24 px-6 bg-[#faf5ff] dark:bg-[#0b0f19]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-violet-100 text-[#6771ab] dark:bg-violet-900/50 dark:text-violet-300 text-xs font-bold uppercase tracking-widest mb-4">
            {t("landing.traditions.badge")}
          </div>
          <h2 className={`${cormorant.className} text-4xl sm:text-5xl font-bold text-[#2d336b] dark:text-slate-200 mb-4`}>
            {t("landing.traditions.heading")}
          </h2>
          <p className="text-slate-500 mb-12 max-w-2xl mx-auto text-base leading-relaxed">
            {t("landing.traditions.subheading")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: "Hindu", icon: "🪔", sub: t("landing.traditions.hinduSub") },
              { name: "Muslim", icon: "☪️", sub: t("landing.traditions.muslimSub") },
              { name: "Sikh", icon: "✡️", sub: t("landing.traditions.sikhSub") },
              { name: "Christian", icon: "✝️", sub: t("landing.traditions.christianSub") },
              { name: "Secular", icon: "🌟", sub: t("landing.traditions.secularSub") },
            ].map((trad) => (
              <div
                key={trad.name}
                className="bg-white dark:bg-slate-900 border border-violet-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
              >
                <div className="text-3xl mb-2" role="img" aria-label={trad.name}>{trad.icon}</div>
                <div className="font-semibold text-[#2d336b] dark:text-slate-200 text-sm">{trad.name}</div>
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
                {t("landing.footer.slogan")}
                <br />
                <a href="https://savazar.com" target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors">{t("landing.footer.consultingLink")}</a>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">{t("landing.footer.colProduct")}</div>
                <ul className="space-y-2 text-white/70">
                  <li><a href="#features" className="hover:text-white transition-colors cursor-pointer">{t("features")}</a></li>
                  <li><a href="#personas" className="hover:text-white transition-colors cursor-pointer">{t("personas")}</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">{t("howItWorks")}</a></li>
                  <li><Link href="/docs" className="hover:text-white transition-colors cursor-pointer">{t("docs")}</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">{t("landing.footer.colAccount")}</div>
                <ul className="space-y-2 text-white/70">
                  <li><Link href="/signup" className="hover:text-white transition-colors cursor-pointer">{t("landing.footer.signUp")}</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors cursor-pointer">{t("signIn")}</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">{t("landing.footer.colCompany")}</div>
                <ul className="space-y-2 text-white/70">
                  <li><a href="https://savazar.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer">Savazar</a></li>
                  <li><a href="https://savazar.com/contact" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer">{t("landing.howItWorks.helpCta")}</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs">
            <span>&copy; {new Date().getFullYear()} Savazar. All rights reserved.</span>
            <span>{t("landing.footer.crafted")}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
