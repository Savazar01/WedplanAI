"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { getR2ConfigAction, saveR2ConfigAction, testR2ConfigAction } from "@/app/actions/r2";
import { Database, Settings, Key, Shield, Send, Check, HelpCircle } from "lucide-react";
import { FieldHelp } from "@/components/ui/field-help";
import Link from "next/link";

export default function R2SettingsPage() {
  const router = useRouter();
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);

  // Form states
  const [accountId, setAccountId] = React.useState("");
  const [accessKeyId, setAccessKeyId] = React.useState("");
  const [secretAccessKey, setSecretAccessKey] = React.useState("");
  const [bucketName, setBucketName] = React.useState("");
  const [publicDomain, setPublicDomain] = React.useState("");
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    async function loadConfig() {
      try {
        const res = await getR2ConfigAction();
        if (res.success && res.config) {
          setAccountId(res.config.accountId);
          setAccessKeyId(res.config.accessKeyId);
          setSecretAccessKey(res.config.secretAccessKey);
          setBucketName(res.config.bucketName);
          setPublicDomain(res.config.publicDomain || "");
          setIsActive(res.config.isActive);
        }
      } catch (err) {
        console.error("Failed to load R2 configuration:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await saveR2ConfigAction({
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName,
        publicDomain: publicDomain || undefined,
        isActive,
      });

      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "R2 storage configuration saved successfully!", type: "success" });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to save configuration.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);

    try {
      const res = await testR2ConfigAction({
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName,
      });

      if (res.error) {
        setToast({ message: `Test failed: ${res.error}`, type: "error" });
      } else {
        setToast({ message: "R2 connection test successful! Upload & credentials are valid.", type: "success" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to test connection.", type: "error" });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="w-full max-w-4xl mr-auto p-6 md:px-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-400 text-sm animate-pulse">Loading R2 configuration...</div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl mr-auto p-6 md:px-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Database className="h-6 w-6 text-[#6771ab]" />
          Cloudflare R2 Storage
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure Cloudflare R2 bucket settings for media and file storage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave}>
            <Card variant="default" className="p-6 bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  R2 Settings
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#6771ab] focus:ring-[#6771ab]"
                  />
                  <span className="text-xs font-semibold text-slate-600">Active</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="accountId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    Cloudflare Account ID <FieldHelp message="Can be found on the Cloudflare Dashboard Home page." />
                  </label>
                  <Input
                    id="accountId"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="Enter your Cloudflare Account ID"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="accessKeyId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Access Key ID
                  </label>
                  <Input
                    id="accessKeyId"
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    placeholder="Enter R2 Access Key ID"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="secretAccessKey" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Secret Access Key
                  </label>
                  <Input
                    id="secretAccessKey"
                    type="password"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    placeholder="Enter R2 Secret Access Key"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="bucketName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bucket Name
                  </label>
                  <Input
                    id="bucketName"
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    placeholder="e.g., wedplanai-media"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="publicDomain" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    Public Custom Domain (Optional) <FieldHelp message="Your Cloudflare R2 bucket public domain or custom domain configured in Cloudflare R2." />
                  </label>
                  <Input
                    id="publicDomain"
                    value={publicDomain}
                    onChange={(e) => setPublicDomain(e.target.value)}
                    placeholder="e.g., https://media.wedplanai.com"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                <Button type="button" variant="secondary" onClick={handleTestConnection} disabled={isTesting}>
                  {isTesting ? "Testing..." : "Test Connection"}
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Quick Help */}
          <Card variant="default" className="p-6 bg-violet-50/50 border border-violet-100 space-y-3">
            <h4 className="text-xs font-bold text-[#2d336b] flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-[#6771ab]" />
              Need Help?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cloudflare R2 is an S3-compatible object storage service that allows you to store images and invoice documents without egress fees.
            </p>
            <Link
              href="/dashboard/docs#cloudflare-r2"
              className="text-xs font-bold text-[#6771ab] hover:underline flex items-center gap-1 mt-2"
            >
              Read Setup Documentation &rarr;
            </Link>
          </Card>
        </div>
      </div>
    </main>
  );
}
