"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { updateWeddingAppearanceAction } from "@/app/actions/wedding";

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
  const router = useRouter();

  // App Theme State
  const [themeFont, setThemeFont] = React.useState(wedding.themeFont || "Geist");
  const [themePrimary, setThemePrimary] = React.useState(wedding.themePrimary || "#6771ab");
  const [themeSecondary, setThemeSecondary] = React.useState(wedding.themeSecondary || "#8b93c5");
  const [themeBackground, setThemeBackground] = React.useState(wedding.themeBackground || "#f8fafc");
  const [logoUrl, setLogoUrl] = React.useState(wedding.logoUrl || "");
  const [logoData, setLogoData] = React.useState(wedding.logoData || "");
  const [logoName, setLogoName] = React.useState("");

  const [isPending, setIsPending] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);
  const [prevWeddingId, setPrevWeddingId] = React.useState(wedding.id);

  if (wedding.id !== prevWeddingId) {
    setPrevWeddingId(wedding.id);
    setThemeFont(wedding.themeFont || "Geist");
    setThemePrimary(wedding.themePrimary || "#6771ab");
    setThemeSecondary(wedding.themeSecondary || "#8b93c5");
    setThemeBackground(wedding.themeBackground || "#f8fafc");
    setLogoUrl(wedding.logoUrl || "");
    setLogoData(wedding.logoData || "");
  }

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
        router.refresh();
        setToast({ message: "App theme settings saved successfully!", type: "success" });
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

  return (
    <div className="space-y-6">
      {themeFontLinkUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={themeFontLinkUrl} rel="stylesheet" />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveAppTheme}>
            <Card className="p-6 space-y-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
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
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">App Preview</h4>
            <Card 
              className="p-5 border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between min-h-[280px] rounded-2xl"
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
