"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { getWhatsAppConfigAction, saveWhatsAppConfigAction, sendTestWhatsAppAction } from "@/app/actions/whatsapp";
import { MessageSquare, Settings, Key, Shield, Send, Check, HelpCircle } from "lucide-react";
import { FieldHelp } from "@/components/ui/field-help";
import Link from "next/link";

export default function WhatsAppSettingsPage() {
  const router = useRouter();
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);

  // Form states
  const [phoneNumberId, setPhoneNumberId] = React.useState("");
  const [businessAccountId, setBusinessAccountId] = React.useState("");
  const [accessToken, setAccessToken] = React.useState("");
  const [apiVersion, setApiVersion] = React.useState("v20.0");
  const [isActive, setIsActive] = React.useState(false);

  // Test state
  const [testRecipient, setTestRecipient] = React.useState("");

  React.useEffect(() => {
    async function loadConfig() {
      try {
        const res = await getWhatsAppConfigAction();
        if (res.success && res.config) {
          setPhoneNumberId(res.config.phoneNumberId);
          setBusinessAccountId(res.config.businessAccountId);
          setAccessToken(res.config.accessToken);
          setApiVersion(res.config.apiVersion || "v20.0");
          setIsActive(res.config.isActive);
        }
      } catch (err) {
        console.error("Failed to load WhatsApp configuration:", err);
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
      const res = await saveWhatsAppConfigAction({
        phoneNumberId,
        businessAccountId,
        accessToken,
        apiVersion,
        isActive,
      });

      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "WhatsApp configuration saved successfully!", type: "success" });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to save configuration.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) {
      setToast({ message: "Please enter a test recipient phone number.", type: "error" });
      return;
    }
    setIsTesting(true);

    try {
      const res = await sendTestWhatsAppAction(testRecipient);
      if (res.error) {
        setToast({ message: `Test failed: ${res.error}`, type: "error" });
      } else {
        setToast({ message: `Test WhatsApp successfully sent to ${testRecipient}!`, type: "success" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to send test WhatsApp.", type: "error" });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="w-full max-w-4xl mr-auto p-6 md:px-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-400 text-sm animate-pulse">Loading WhatsApp configuration...</div>
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
          <MessageSquare className="h-6 w-6 text-[#6771ab]" />
          WhatsApp Integration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure Meta WhatsApp Business Cloud API settings.
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
                  API Settings
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
                  <label htmlFor="phoneNumberId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    Phone Number ID <FieldHelp message="The unique ID of the registered phone number in your Meta developer app." />
                  </label>
                  <Input
                    id="phoneNumberId"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="e.g., 1056589412547"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="businessAccountId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    WhatsApp Business Account ID <FieldHelp message="The ID of your Meta WhatsApp Business Account." />
                  </label>
                  <Input
                    id="businessAccountId"
                    value={businessAccountId}
                    onChange={(e) => setBusinessAccountId(e.target.value)}
                    placeholder="e.g., 104523879854"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="accessToken" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    System User Access Token <FieldHelp message="Permanent system user token with access to WhatsApp message sending permissions." />
                  </label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Enter your Meta Access Token"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="apiVersion" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    API Version
                  </label>
                  <Input
                    id="apiVersion"
                    value={apiVersion}
                    onChange={(e) => setApiVersion(e.target.value)}
                    placeholder="e.g., v20.0"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {/* Info & Testing Panels */}
        <div className="space-y-6">
          {/* Test Panel */}
          <Card variant="default" className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest flex items-center gap-2">
              <Send className="h-4 w-4" />
              Test Send
            </h3>
            <p className="text-xs text-slate-500">
              Send a test notification to verify that the WhatsApp credentials are correct.
            </p>
            <form onSubmit={handleSendTest} className="space-y-3">
              <Input
                type="text"
                placeholder="Recipient Phone Number (with code)"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
              />
              <Button
                type="submit"
                variant="secondary"
                className="w-full text-xs font-semibold gap-1.5 h-9"
                disabled={isTesting}
              >
                <Send className="h-3 w-3" />
                {isTesting ? "Testing..." : "Send Test Message"}
              </Button>
            </form>
          </Card>

          {/* Quick Help */}
          <Card variant="default" className="p-6 bg-violet-50/50 border border-violet-100 space-y-3">
            <h4 className="text-xs font-bold text-[#2d336b] flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-[#6771ab]" />
              Need Help?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              To integrate the WhatsApp Business API, you will need a Meta Developer account and a business profile.
            </p>
            <Link
              href="/dashboard/docs#whatsapp-integration"
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
