"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { FieldHelp } from "@/components/ui/field-help";
import {
  getLLMConfigsAction,
  saveLLMConfigAction,
  testLLMConfigAction,
  setActiveLLMProviderAction
} from "@/app/actions/llm";
import { Bot, Sparkles, Cpu, Check, Key, Settings, HelpCircle, Activity, Globe } from "lucide-react";

interface LLMConfig {
  id: string;
  provider: string;
  apiKey: string | null;
  baseUrl: string | null;
  defaultModel: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PROVIDERS = [
  { id: "openai", name: "OpenAI", defaultUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini", models: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"] },
  { id: "anthropic", name: "Anthropic", defaultUrl: "https://api.anthropic.com", defaultModel: "claude-3-5-sonnet-20241022", models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"] },
  { id: "gemini", name: "Google Gemini", defaultUrl: "https://generativelanguage.googleapis.com", defaultModel: "gemini-1.5-flash", models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"] },
  { id: "openrouter", name: "OpenRouter", defaultUrl: "https://openrouter.ai/api/v1", defaultModel: "meta-llama/llama-3.1-8b-instruct:free", models: ["meta-llama/llama-3.1-8b-instruct:free", "google/gemini-flash-1.5", "anthropic/claude-3.5-sonnet"] },
  { id: "custom", name: "Custom (OpenAI Compatible)", defaultUrl: "", defaultModel: "", models: [] as string[] }
];

export default function LLMSettingsPage() {
  const router = useRouter();
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [isActivating, setIsActivating] = React.useState(false);

  const [configs, setConfigs] = React.useState<LLMConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = React.useState("openai");

  // Form states
  const [apiKey, setApiKey] = React.useState("");
  const [baseUrl, setBaseUrl] = React.useState("");
  const [defaultModel, setDefaultModel] = React.useState("");
  const [isActive, setIsActive] = React.useState(false);

  const syncForm = React.useCallback((providerId: string, currentConfigs: LLMConfig[]) => {
    const existing = currentConfigs.find((c) => c.provider === providerId);
    const providerDef = PROVIDERS.find((p) => p.id === providerId);

    if (existing) {
      setApiKey(existing.apiKey || "");
      setBaseUrl(existing.baseUrl || "");
      setDefaultModel(existing.defaultModel);
      setIsActive(existing.isActive);
    } else {
      setApiKey("");
      setBaseUrl("");
      setDefaultModel(providerDef?.defaultModel || "");
      setIsActive(false);
    }
  }, []);

  const loadConfigs = React.useCallback(async (currentProviderId = selectedProviderId) => {
    try {
      const res = await getLLMConfigsAction();
      if (res.success && res.configs) {
        const loaded = res.configs as LLMConfig[];
        setConfigs(loaded);
        syncForm(currentProviderId, loaded);
      } else if (res.error) {
        setToast({ message: res.error, type: "error" });
      }
    } catch (err) {
      console.error("Failed to load LLM configurations:", err);
      setToast({ message: "Failed to load LLM configurations.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [selectedProviderId, syncForm]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConfigs();
  }, [loadConfigs]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await saveLLMConfigAction({
        provider: selectedProviderId,
        apiKey: apiKey || undefined,
        baseUrl: baseUrl || undefined,
        defaultModel,
        isActive,
      });

      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "LLM configuration saved successfully!", type: "success" });
        await loadConfigs();
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
      const res = await testLLMConfigAction({
        provider: selectedProviderId,
        apiKey: apiKey || undefined,
        baseUrl: baseUrl || undefined,
        defaultModel,
      });

      if (res.error) {
        setToast({ message: `Test failed: ${res.error}`, type: "error" });
      } else {
        setToast({
          message: `Connection successful! Response: "${res.response}"`,
          type: "success",
        });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to test connection.", type: "error" });
    } finally {
      setIsTesting(false);
    }
  };

  const handleActivate = async () => {
    const existing = configs.find((c) => c.provider === selectedProviderId);
    if (!existing) {
      setToast({ message: "Please save the configuration before activating it.", type: "error" });
      return;
    }

    setIsActivating(true);
    try {
      const res = await setActiveLLMProviderAction(selectedProviderId);
      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: `${PROVIDERS.find(p => p.id === selectedProviderId)?.name} activated successfully!`, type: "success" });
        await loadConfigs();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to activate provider.", type: "error" });
    } finally {
      setIsActivating(false);
    }
  };

  if (isLoading) {
    return (
      <main className="w-full max-w-5xl mr-auto p-6 md:px-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-400 text-sm animate-pulse">Loading LLM configurations...</div>
      </main>
    );
  }

  const selectedProviderDef = PROVIDERS.find((p) => p.id === selectedProviderId);
  const activeConfig = configs.find((c) => c.isActive);

  return (
    <main className="w-full max-w-5xl mr-auto p-6 md:px-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bot className="h-6 w-6 text-[#6771ab]" />
            AI & LLM Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage Large Language Model settings, endpoints, and credentials for AI assistant features.
          </p>
        </div>

        {activeConfig && (
          <div className="bg-[#eef0f7] border border-slate-200 text-[#2d336b] px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm text-xs font-semibold self-start md:self-auto">
            <Sparkles className="h-4 w-4 text-[#6771ab] animate-pulse" />
            <span>Active Provider: <strong className="uppercase">{activeConfig.provider}</strong> ({activeConfig.defaultModel})</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Providers Selection List */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-[#6771ab] uppercase tracking-wider pl-1">
            Select Provider
          </h3>
          <div className="flex flex-col gap-2">
            {PROVIDERS.map((provider) => {
              const dbConfig = configs.find((c) => c.provider === provider.id);
              const isSelected = selectedProviderId === provider.id;

              return (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProviderId(provider.id);
                    syncForm(provider.id, configs);
                  }}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-1 ${
                    isSelected
                      ? "bg-white border-[#6771ab] shadow-md ring-2 ring-[#eef0f7]"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800">
                      {provider.name}
                    </span>
                    {dbConfig?.isActive && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        Active
                      </span>
                    )}
                    {!dbConfig?.isActive && dbConfig && (
                      <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Configured
                      </span>
                    )}
                  </div>
                  {dbConfig ? (
                    <span className="text-[11px] text-slate-500 truncate mt-1">
                      Model: {dbConfig.defaultModel}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic mt-1">
                      Not configured
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave}>
            <Card variant="default" className="p-6 bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configure {selectedProviderDef?.name}
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
                  <label htmlFor="baseUrl" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    Base URL (Optional) <FieldHelp message="Override default endpoint for the provider (useful for reverse proxies or local models)." />
                  </label>
                  <div className="relative">
                    <Input
                      id="baseUrl"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder={selectedProviderDef?.defaultUrl || "Enter custom URL"}
                    />
                    <Globe className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  {selectedProviderDef?.defaultUrl && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Default: <code className="bg-slate-50 px-1 py-0.5 rounded">{selectedProviderDef.defaultUrl}</code>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="apiKey" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={apiKey ? "••••••••••••••••" : "Enter API Key"}
                      required={selectedProviderId !== "custom"}
                    />
                    <Key className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="defaultModel" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Default Model
                  </label>
                  <div className="relative">
                    <Input
                      id="defaultModel"
                      value={defaultModel}
                      onChange={(e) => setDefaultModel(e.target.value)}
                      placeholder="Enter Model Identifier"
                      required
                    />
                    <Cpu className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {selectedProviderDef?.models && selectedProviderDef.models.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] font-medium text-slate-500 mr-1">Suggestions:</span>
                      {selectedProviderDef.models.map((model) => (
                        <button
                          key={model}
                          type="button"
                          onClick={() => setDefaultModel(model)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] px-2 py-0.5 rounded-full transition-all border border-slate-200"
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-6 gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleTestConnection}
                    disabled={isTesting || !defaultModel}
                    className="flex items-center gap-1.5"
                  >
                    {isTesting ? (
                      <span className="animate-spin mr-1">⚡</span>
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                    Test Connection
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleActivate}
                    disabled={isActivating || !configs.find((c) => c.provider === selectedProviderId)}
                    className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    <Check className="h-4 w-4 text-emerald-600" />
                    Activate Provider
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5"
                >
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </Card>
          </form>

          {/* Help Card */}
          <Card variant="cream" className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#6771ab] uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Configuration Notes
            </h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>
                <strong>API Keys</strong> are securely saved to the database. They are required to authenticate calls to OpenAI, Anthropic, Gemini, and OpenRouter.
              </li>
              <li>
                To use local models (e.g. Ollama, LM Studio), select <strong>Custom (OpenAI Compatible)</strong>, set the Base URL to your local endpoint (e.g. <code className="bg-yellow-50 px-1 py-0.5 rounded">http://localhost:11434/v1</code>), enter a dummy API key if required, and specify the model name.
              </li>
              <li>
                Only the <strong>Active Provider</strong> will be used throughout the app for AI Assistant generation.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  );
}
