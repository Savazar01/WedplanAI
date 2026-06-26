import { getServerSession } from "@/lib/auth-server";
import { Cormorant_Infant } from "next/font/google";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingContent from "@/components/landing/LandingContent";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "WedPlanAI",
            "description": "AI-powered, self-hosted wedding planning platform. Manage tasks, guests, vendors, ceremonies, catering, and budgets with multi-tradition support.",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Linux, Docker",
            "browserRequirements": "Requires modern browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
            },
            "author": {
              "@type": "Organization",
              "name": "Savazar",
              "url": "https://savazar.com",
            },
          }),
        }}
      />
      <LandingNavbar isLoggedIn={isLoggedIn} />
      <LandingContent isLoggedIn={isLoggedIn} />
    </div>
  );
}
