import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WedPlanAI — Open-Source Wedding Planning Platform | Self-Hosted Wedding Management Software",
  description: "WedPlanAI is an AI-powered, self-hosted wedding planning platform for wedding planners and DIY couples. Manage tasks, guests, vendors, ceremonies, catering, and budgets. Supports Hindu, Muslim, Sikh, Christian, and Secular weddings. Docker-based deployment with full REST API.",
  keywords: [
    "wedding planning software",
    "wedding management platform",
    "self-hosted wedding planner",
    "open source wedding planner",
    "Indian wedding planner app",
    "Hindu wedding planning software",
    "wedding task management",
    "wedding RSVP system",
    "wedding vendor management",
    "wedding catering planner",
    "multi-couple wedding planner",
    "wedding ceremony planner",
    "docker wedding planner",
    "Savazar WedPlanAI",
    "wedding website builder",
    "wedding guest list manager",
    "wedding budget tracker",
    "wedding tradition templates",
  ].join(", "),
  openGraph: {
    title: "WedPlanAI — Self-Hosted Wedding Planning Platform",
    description: "AI-powered wedding planning for every tradition. Deploy on your own infrastructure. Manage tasks, guests, vendors, ceremonies, and budgets.",
    url: "https://savazar.com",
    siteName: "WedPlanAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WedPlanAI — Open-Source Wedding Planning Platform",
    description: "AI-powered, self-hosted wedding planning for every tradition. Deploy via Docker.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
