"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { updateWeddingAppearanceAction, updateWeddingShowcaseAction } from "@/app/actions/wedding";

interface Wedding {
  id: string;
  partnerA: string;
  partnerB: string;
  themeFont: string;
  themePrimary: string;
  themeSecondary: string;
  themeBackground: string;
  logoUrl?: string | null;
  logoData?: string | null;
  showcaseFont?: string | null;
  showcasePrimary?: string | null;
  showcaseSecondary?: string | null;
  showcaseBackground?: string | null;
  showcaseHeroUrl?: string | null;
  showcaseHeroData?: string | null;
  showcaseWelcomeText?: string | null;
  showcaseDetails?: string | null;
}

interface AppearanceFormClientProps {
  wedding: Wedding;
}

const fonts = [
  "Geist", "Inter", "Outfit", "Montserrat", "Playfair Display", "Cinzel", 
  "Cormorant Garamond", "Bodoni Moda", "Lora", "Prata", "Great Vibes", 
  "Alex Brush", "Pinyon Script", "Allura", "Sacramento", "Italianno"
];

export default function AppearanceFormClient({ wedding }: AppearanceFormClientProps) {
  const [activeTab, setActiveTab] = React.useState<"app" | "showcase">("app");

  // App Theme State
  const [themeFont, setThemeFont] = React.useState(wedding.themeFont || "Geist");
  const [themePrimary, setThemePrimary] = React.useState(wedding.themePrimary || "#6771ab");
  const [themeSecondary, setThemeSecondary] = React.useState(wedding.themeSecondary || "#8b93c5");
  const [themeBackground, setThemeBackground] = React.useState(wedding.themeBackground || "#f8fafc");
  const [logoUrl, setLogoUrl] = React.useState(wedding.logoUrl || "");
  const [logoData, setLogoData] = React.useState(wedding.logoData || "");
  const [logoName, setLogoName] = React.useState("");

  // Showcase Website State
  const [showcaseFont, setShowcaseFont] = React.useState(wedding.showcaseFont || "Playfair Display");
  const [showcasePrimary, setShowcasePrimary] = React.useState(wedding.showcasePrimary || "#c484b0");
  const [showcaseSecondary, setShowcaseSecondary] = React.useState(wedding.showcaseSecondary || "#e6b7d2");
  const [showcaseBackground, setShowcaseBackground] = React.useState(wedding.showcaseBackground || "#fffafb");
  const [heroUrl, setHeroUrl] = React.useState(wedding.showcaseHeroUrl || "");
  const [heroData, setHeroData] = React.useState(wedding.showcaseHeroData || "");
  const [heroName, setHeroName] = React.useState("");
  const [showcaseWelcomeText, setShowcaseWelcomeText] = React.useState(wedding.showcaseWelcomeText || "");
  const [showcaseDetails, setShowcaseDetails] = React.useState(wedding.showcaseDetails || "");

  const [isPending, setIsPending] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAppTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const res = await updateWeddingAppearanceAction(wedding.id, {
        themeFont,
        themePrimary,
        themeSecondary,
        themeBackground,
        logoUrl: logoUrl || null,
        logoData: logoData || null,
      });

      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "App theme settings saved successfully!", type: "success" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "An error occurred while saving.", type: "error" });
    } finally {
      setIsPending(false);
    }
  };

  const handleSaveShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const res = await updateWeddingShowcaseAction(wedding.id, {
        showcaseFont,
        showcasePrimary,
        showcaseSecondary,
        showcaseBackground,
        showcaseHeroUrl: heroUrl || null,
        showcaseHeroData: heroData || null,
        showcaseWelcomeText: showcaseWelcomeText || null,
        showcaseDetails: showcaseDetails || null,
      });

      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "Showcase website settings saved successfully!", type: "success" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "An error occurred while saving.", type: "error" });
    } finally {
      setIsPending(false);
    }
  };

  // Google Font Import URL for Preview
  const themeFontLinkUrl = fonts.includes(themeFont)
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(themeFont.replace(/[^a-zA-Z0-9\s-]/g, ""))}&display=swap`
    : "";

  const showcaseFontLinkUrl = fonts.includes(showcaseFont)
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(showcaseFont.replace(/[^a-zA-Z0-9\s-]/g, ""))}&display=swap`
    : "";

  return (
    <div className="space-y-6">
      {themeFontLinkUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={themeFontLinkUrl} rel="stylesheet" />
        </>
      )}
      {showcaseFontLinkUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={showcaseFontLinkUrl} rel="stylesheet" />
        </>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "app"
              ? "border-[#6771ab] text-[#6771ab]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("app")}
        >
          App Theme
        </button>
        <button
          type="button"
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "showcase"
              ? "border-[#6771ab] text-[#6771ab]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("showcase")}
        >
          Showcase Website
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Form */}
        <div className="lg:col-span-2">
          {activeTab === "app" ? (
            <form onSubmit={handleSaveAppTheme}>
              <Card className="p-6 space-y-6 bg-white border border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">App Theme Settings</h3>
                  <p className="text-xs text-slate-500">Modify typography, brand colors, and logo of the admin dashboard and internal pages.</p>
                </div>

                {/* Typography Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700">Typography</h4>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                      Font Family
                    </label>
                    <Select
                      value={themeFont}
                      onChange={(e) => setThemeFont(e.target.value)}
                      disabled={isPending}
                    >
                      {fonts.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Color Palette Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700">Brand Color Palette</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Primary Color */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themePrimary}
                          onChange={(e) => setThemePrimary(e.target.value)}
                          disabled={isPending}
                          className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
                        />
                        <Input
                          type="text"
                          value={themePrimary}
                          onChange={(e) => setThemePrimary(e.target.value)}
                          disabled={isPending}
                          className="font-mono text-sm"
                          placeholder="#6771ab"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          required
                        />
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSecondary}
                          onChange={(e) => setThemeSecondary(e.target.value)}
                          disabled={isPending}
                          className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
                        />
                        <Input
                          type="text"
                          value={themeSecondary}
                          onChange={(e) => setThemeSecondary(e.target.value)}
                          disabled={isPending}
                          className="font-mono text-sm"
                          placeholder="#8b93c5"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          required
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeBackground}
                          onChange={(e) => setThemeBackground(e.target.value)}
                          disabled={isPending}
                          className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
                        />
                        <Input
                          type="text"
                          value={themeBackground}
                          onChange={(e) => setThemeBackground(e.target.value)}
                          disabled={isPending}
                          className="font-mono text-sm"
                          placeholder="#f8fafc"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo Settings Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700">Logo Branding</h4>
                  
                  {/* URL field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                      Logo Image URL
                    </label>
                    <Input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      disabled={isPending}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Upload field */}
                  <div className="space-y-1 pt-2">
                    <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
                      Upload Logo File
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2 px-4 rounded-xl border border-slate-200 transition-all active:scale-[0.97]">
                        Choose Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          disabled={isPending}
                          className="hidden"
                        />
                      </label>
                      {logoName ? (
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">
                          {logoName}
                        </span>
                      ) : logoData ? (
                        <span className="text-xs text-slate-500 italic">
                          Stored custom upload
                        </span>
                      ) : null}
                      {logoData && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 font-semibold h-8"
                          disabled={isPending}
                          onClick={() => {
                            setLogoData("");
                            setLogoName("");
                          }}
                        >
                          Clear Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    className="bg-[#6771ab] hover:bg-[#566198] text-white px-6 font-semibold"
                    disabled={isPending}
                  >
                    {isPending ? "Saving changes..." : "Save App Theme"}
                  </Button>
                </div>
              </Card>
            </form>
          ) : (
            <form onSubmit={handleSaveShowcase}>
              <Card className="p-6 space-y-6 bg-white border border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Showcase Website Settings</h3>
                  <p className="text-xs text-slate-500">Customize typography, colors, banners, and layout of the public wedding showcase page.</p>
                </div>

                {/* Typography Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700">Typography</h4>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                      Showcase Font Family
                    </label>
                    <Select
                      value={showcaseFont}
                      onChange={(e) => setShowcaseFont(e.target.value)}
                      disabled={isPending}
                    >
                      {fonts.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Color Palette Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700">Showcase Color Palette</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Primary Color */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={showcasePrimary}
                          onChange={(e) => setShowcasePrimary(e.target.value)}
                          disabled={isPending}
                          className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
                        />
                        <Input
                          type="text"
                          value={showcasePrimary}
                          onChange={(e) => setShowcasePrimary(e.target.value)}
                          disabled={isPending}
                          className="font-mono text-sm"
                          placeholder="#c484b0"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          required
                        />
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={showcaseSecondary}
                          onChange={(e) => setShowcaseSecondary(e.target.value)}
                          disabled={isPending}
                          className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
                        />
                        <Input
                          type="text"
                          value={showcaseSecondary}
                          onChange={(e) => setShowcaseSecondary(e.target.value)}
                          disabled={isPending}
                          className="font-mono text-sm"
                          placeholder="#e6b7d2"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          required
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={showcaseBackground}
                          onChange={(e) => setShowcaseBackground(e.target.value)}
                          disabled={isPending}
                          className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
                        />
                        <Input
                          type="text"
                          value={showcaseBackground}
                          onChange={(e) => setShowcaseBackground(e.target.value)}
                          disabled={isPending}
                          className="font-mono text-sm"
                          placeholder="#fffafb"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero Image Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700">Showcase Hero Image</h4>
                  
                  {/* URL field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                      Hero Image URL
                    </label>
                    <Input
                      type="url"
                      value={heroUrl}
                      onChange={(e) => setHeroUrl(e.target.value)}
                      disabled={isPending}
                      placeholder="https://example.com/hero.jpg"
                    />
                  </div>

                  {/* Upload field */}
                  <div className="space-y-1 pt-2">
                    <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
                      Upload Hero File
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2 px-4 rounded-xl border border-slate-200 transition-all active:scale-[0.97]">
                        Choose Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroFileChange}
                          disabled={isPending}
                          className="hidden"
                        />
                      </label>
                      {heroName ? (
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">
                          {heroName}
                        </span>
                      ) : heroData ? (
                        <span className="text-xs text-slate-500 italic">
                          Stored custom upload
                        </span>
                      ) : null}
                      {heroData && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 font-semibold h-8"
                          disabled={isPending}
                          onClick={() => {
                            setHeroData("");
                            setHeroName("");
                          }}
                        >
                          Clear Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Welcome Text Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700">Showcase Welcome Content</h4>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                      Welcome Text / Title
                    </label>
                    <textarea
                      value={showcaseWelcomeText}
                      onChange={(e) => setShowcaseWelcomeText(e.target.value)}
                      disabled={isPending}
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#6771ab] focus:border-[#6771ab] font-sans"
                      placeholder="e.g. Welcome to our wedding details page!"
                    />
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                      Our Story / Showcase Details
                    </label>
                    <textarea
                      value={showcaseDetails}
                      onChange={(e) => setShowcaseDetails(e.target.value)}
                      disabled={isPending}
                      rows={4}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#6771ab] focus:border-[#6771ab] font-sans"
                      placeholder="e.g. Describe how you met or add details about dress code, RSVP deadlines, etc."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    className="bg-[#6771ab] hover:bg-[#566198] text-white px-6 font-semibold"
                    disabled={isPending}
                  >
                    {isPending ? "Saving changes..." : "Save Showcase Settings"}
                  </Button>
                </div>
              </Card>
            </form>
          )}
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* App Preview Card */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">App Preview</h4>
            <Card 
              className="p-5 border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between min-h-[280px]"
              style={{ 
                backgroundColor: themeBackground, 
                fontFamily: `"${themeFont}", sans-serif` 
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
                  {logoData ? (
                    <img
                      src={logoData}
                      alt="Logo Preview"
                      className="max-h-6 max-w-[100px] object-contain"
                    />
                  ) : logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="max-h-6 max-w-[100px] object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold" style={{ color: themePrimary }}>
                      💒 Wedding App
                    </span>
                  )}
                  <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                    Dashboard
                  </span>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-extrabold text-slate-800">
                    Guest Invitation Manager
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    Configure your guest lists, print customized RSVP cards, and monitor attendance updates.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 mt-auto">
                <button
                  type="button"
                  className="flex-1 text-[10px] font-bold py-2 px-3 rounded-lg text-white"
                  style={{ backgroundColor: themePrimary }}
                >
                  Primary Action
                </button>
                <button
                  type="button"
                  className="flex-1 text-[10px] font-bold py-2 px-3 rounded-lg border bg-transparent"
                  style={{ 
                    borderColor: themeSecondary, 
                    color: themeSecondary 
                  }}
                >
                  Secondary
                </button>
              </div>
            </Card>
          </div>

          {/* Showcase Preview Card */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Showcase Preview</h4>
            <Card 
              className="border border-slate-200 overflow-hidden shadow-sm flex flex-col min-h-[350px]"
              style={{ 
                backgroundColor: showcaseBackground, 
                fontFamily: `"${showcaseFont}", sans-serif` 
              }}
            >
              {/* Hero Banner Crop in Preview */}
              {(heroData || heroUrl) ? (
                <div className="w-full h-20 overflow-hidden border-b border-slate-200/50">
                  <img
                    src={heroData || heroUrl}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-12 bg-slate-100/50 flex items-center justify-center text-[10px] text-slate-400 border-b border-slate-200/50 italic">
                  No Hero Banner Selected
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3 text-center">
                  <span 
                    className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-800"
                  >
                    Celebration Label
                  </span>

                  <h5 
                    className="text-lg font-bold leading-tight"
                    style={{ color: showcasePrimary }}
                  >
                    {wedding.partnerA} & {wedding.partnerB}
                  </h5>

                  <p className="text-[10px] text-slate-500 font-medium">
                    Save the Date • October 12, 2026
                  </p>

                  {/* Our Story preview inside showcase preview */}
                  {(showcaseWelcomeText || showcaseDetails) && (
                    <div className="p-3 bg-white/80 border border-slate-200/50 rounded-xl text-left space-y-1">
                      <span className="text-[9px] font-bold block" style={{ color: showcasePrimary }}>
                        Our Story
                      </span>
                      {showcaseWelcomeText && (
                        <p className="text-[10px] text-slate-700 font-semibold truncate">
                          {showcaseWelcomeText}
                        </p>
                      )}
                      {showcaseDetails && (
                        <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">
                          {showcaseDetails}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-auto">
                  <button
                    type="button"
                    className="w-full text-[10px] font-bold py-2 px-3 rounded-lg text-white"
                    style={{ backgroundColor: showcasePrimary }}
                  >
                    RSVP to Wedding
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
