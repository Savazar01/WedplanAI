"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { saveEmailConfigAction, sendTestEmailAction } from "@/app/actions/email";
import { Mail, Settings, Key, Shield, Send, Check } from "lucide-react";
import { FieldHelp } from "@/components/ui/field-help";
import Link from "next/link";

interface EmailConfig {
  id: string;
  provider: string; // 'gmail', 'sendgrid', 'disabled'
  senderEmail: string;
  clientId: string | null;
  clientSecret: string | null;
  refreshToken: string | null;
  apiKey: string | null;
  isActive: boolean;
}

interface EmailSettingsClientProps {
  initialConfig: EmailConfig | null;
}

export default function EmailSettingsClient({ initialConfig }: EmailSettingsClientProps) {
  const router = useRouter();
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);

  // Form states
  const [provider, setProvider] = React.useState<"gmail" | "sendgrid" | "disabled">(
    (initialConfig?.provider as "gmail" | "sendgrid" | "disabled") || "disabled"
  );
  const [senderEmail, setSenderEmail] = React.useState(initialConfig?.senderEmail || "");
  const [clientId, setClientId] = React.useState(initialConfig?.clientId || "");
  const [clientSecret, setClientSecret] = React.useState(initialConfig?.clientSecret || "");
  const [refreshToken, setRefreshToken] = React.useState(initialConfig?.refreshToken || "");
  const [apiKey, setApiKey] = React.useState(initialConfig?.apiKey || "");
  const [isActive, setIsActive] = React.useState(initialConfig?.isActive ?? true);

  // Test email state
  const [testRecipient, setTestRecipient] = React.useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await saveEmailConfigAction({
        provider,
        senderEmail,
        clientId: provider === "gmail" ? clientId : null,
        clientSecret: provider === "gmail" ? clientSecret : null,
        refreshToken: provider === "gmail" ? refreshToken : null,
        apiKey: provider === "sendgrid" ? apiKey : null,
        isActive,
      });

      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "Email configuration saved successfully!", type: "success" });
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
      setToast({ message: "Please enter a test recipient email address.", type: "error" });
      return;
    }
    setIsTesting(true);

    try {
      const res = await sendTestEmailAction(testRecipient);
      if (res.error) {
        setToast({ message: `Test failed: ${res.error}`, type: "error" });
      } else {
        setToast({ message: `Test email successfully sent to ${testRecipient}!`, type: "success" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to send test email.", type: "error" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mr-auto p-6 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Save Settings Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#eef0f7] text-[#2d336b] rounded-xl">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Email Integration</h1>
            <p className="text-sm text-slate-500">Configure SMTP, API integration, and email delivery providers.</p>
          </div>
        </div>

        <Card variant="cream" className="p-6 md:p-8 border border-slate-200 shadow-sm bg-white">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                  Delivery Provider <FieldHelp message="Select the service you want to use to send emails from your application." />
                </label>
                <Select
                  id="email-provider-select"
                  name="provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as "gmail" | "sendgrid" | "disabled")}
                >
                  <option value="disabled">Disabled / Off</option>
                  <option value="sendgrid">SendGrid API</option>
                  <option value="gmail">Google Gmail OAuth2</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                  Sender Email Address <FieldHelp message="The email address your emails will appear to come from." />
                </label>
                <Input
                  type="email"
                  placeholder="e.g. no-reply@mywedding.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  disabled={provider === "disabled"}
                  required={provider !== "disabled"}
                />
                <p className="text-xs text-slate-400 mt-1">Must be authorized in your provider credentials.</p>
              </div>
            </div>

            {/* Provider Specific Configuration fields */}
            {provider === "sendgrid" && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                    <Key className="h-4 w-4 text-[#6771ab]" />
                    <span>SendGrid Settings</span>
                  </div>
                  <Link href="/dashboard/docs#email-integration" className="text-xs text-[#6771ab] hover:underline font-semibold">
                    View Setup Instructions
                  </Link>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                    SendGrid API Key <FieldHelp message="Your SendGrid API Key with Mail Send access." />
                  </label>
                  <Input
                    name="apiKey"
                    type="password"
                    placeholder="SG.xxxxxxxxxxxxxxxxxxxxxx"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">Generate a key with Mail Send access in your SendGrid dashboard.</p>
                </div>
              </div>
            )}

            {provider === "gmail" && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                    <Shield className="h-4 w-4 text-[#6771ab]" />
                    <span>Gmail OAuth2 Credentials</span>
                  </div>
                  <Link href="/dashboard/docs#email-integration" className="text-xs text-[#6771ab] hover:underline font-semibold">
                    View Setup Instructions
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                      Client ID <FieldHelp message="Google OAuth Client ID from Google Cloud Console." />
                    </label>
                    <Input
                      name="clientId"
                      type="text"
                      placeholder="Google OAuth Client ID"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                      Client Secret <FieldHelp message="Google OAuth Client Secret from Google Cloud Console." />
                    </label>
                    <Input
                      name="clientSecret"
                      type="password"
                      placeholder="Google OAuth Client Secret"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                    Refresh Token <FieldHelp message="The refresh token obtained via Google OAuth Playground." />
                  </label>
                  <Input
                    name="refreshToken"
                    type="password"
                    placeholder="OAuth2 Refresh Token"
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Retrieve a refresh token from Google OAuth playground with <code>https://www.googleapis.com/auth/gmail.send</code> scope.
                  </p>
                </div>
              </div>
            )}

            {/* Is Active Status toggle */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700">Enable Configuration</span>
                <span className="text-xs text-slate-400">Enable this configuration for sending guest invitations.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                  disabled={provider === "disabled"}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6771ab] disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#6771ab] hover:bg-[#586299] text-white px-6 py-2 rounded-xl transition-all cursor-pointer font-semibold"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Test Integration Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Test Connection</h2>
            <p className="text-xs text-slate-500">Verify system setup quickly.</p>
          </div>
        </div>

        <Card variant="cream" className="p-6 border border-slate-200 bg-white shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-[#6771ab]">Send Test Email</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Immediately trigger a verification mail using the active system credentials to verify they are functioning correctly.
          </p>

          <form onSubmit={handleSendTest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Recipient Email
              </label>
              <Input
                type="email"
                placeholder="e.g. test@example.com"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                disabled={provider === "disabled" || isTesting}
                required
              />
            </div>

            <Button
              type="submit"
              variant="ghost"
              disabled={provider === "disabled" || isTesting || !testRecipient}
              className="w-full bg-[#fcf9f9] text-[#6771ab] border border-slate-200 hover:bg-[#f6f2f2] flex items-center justify-center gap-2 cursor-pointer font-semibold py-2 rounded-xl transition-all"
            >
              {isTesting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Test Email</span>
                </>
              )}
            </Button>
          </form>

          {initialConfig && (
            <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Active configuration detected</span>
              </div>
              <p>
                <strong>Active Provider:</strong>{" "}
                <span className="uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">
                  {initialConfig.provider}
                </span>
              </p>
            </div>
          )}
        </Card>
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
