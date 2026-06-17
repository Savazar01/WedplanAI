"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { createApiKeyAction, revokeApiKeyAction } from "@/app/actions/api-keys";
import { Key, Copy, Trash2, Check } from "lucide-react";

interface SerializedApiKey {
  id: string;
  weddingId: string;
  name: string;
  keyHash: string;
  createdAt: string;
  expiresAt: string;
}

interface ApiKeyManagerClientProps {
  initialKeys: SerializedApiKey[];
}

export default function ApiKeyManagerClient({ initialKeys }: ApiKeyManagerClientProps) {
  const router = useRouter();
  const [keys, setKeys] = React.useState<SerializedApiKey[]>(initialKeys);
  const [keyName, setKeyName] = React.useState("");
  const [rawKey, setRawKey] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  
  // Revocation state
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [isRevoking, setIsRevoking] = React.useState(false);

  // Toast notification state
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  React.useEffect(() => {
    setKeys(initialKeys);
  }, [initialKeys]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      setToast({ message: "Key name cannot be empty", type: "error" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await createApiKeyAction(keyName);
      if (result.success && result.rawKey) {
        setRawKey(result.rawKey);
        setKeyName("");
        setToast({ message: "API key generated successfully!", type: "success" });
        router.refresh();
      } else {
        setToast({ message: "Failed to generate API key", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ 
        message: err instanceof Error ? err.message : "An error occurred", 
        type: "error" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async () => {
    if (!deleteConfirmId) return;
    setIsRevoking(true);
    try {
      const result = await revokeApiKeyAction(deleteConfirmId);
      if (result.success) {
        setKeys(prev => prev.filter(k => k.id !== deleteConfirmId));
        setToast({ message: "API key revoked successfully", type: "success" });
        router.refresh();
      } else {
        setToast({ message: "Failed to revoke API key", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ 
        message: err instanceof Error ? err.message : "An error occurred", 
        type: "error" 
      });
    } finally {
      setIsRevoking(false);
      setDeleteConfirmId(null);
    }
  };

  const handleCopy = async () => {
    if (!rawKey) return;
    try {
      await navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setToast({ message: "API key copied to clipboard!", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setToast({ message: "Failed to copy key", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Key className="h-6 w-6 text-[#6771ab]" />
          API Key Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate and manage API keys for programmatic access to your wedding planner event.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card variant="cream" className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-[#6771ab] mb-2">Generate API Key</h2>
            <p className="text-xs text-slate-500 mb-6">
              Give your API key a descriptive name (e.g. &quot;External Calendar Sync&quot;) to identify it later.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest block mb-1">
                  Key Name
                </label>
                <Input
                  placeholder="e.g. Integration Sync"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  disabled={isGenerating}
                  required
                />
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate API Key"}
              </Button>
            </form>
          </Card>

          {rawKey && (
            <Card variant="default" className="p-6 border-l-4 border-l-[#ffcc00] border-slate-200 bg-white">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Your New API Key</h3>
              <p className="text-xs text-red-600 mb-4 font-medium">
                ⚠️ Make sure to copy your API key now. You will not be able to see it again!
              </p>
              <div className="bg-[#eef0f7] border border-[#cbd5e1] rounded-xl p-3 font-mono text-xs text-[#2d336b] flex items-center justify-between gap-3">
                <span className="select-all break-all whitespace-pre-wrap">{rawKey}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopy} 
                  className="shrink-0 text-[#6771ab] hover:text-[#2d336b]"
                  title="Copy Key"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Active API Keys ({keys.length})</h2>
          
          <Card variant="default" className="overflow-hidden bg-white shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              {keys.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-medium">No active API keys found.</p>
                  <p className="text-xs text-slate-400 mt-1">Generate a key on the left to get started.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Created At</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Expires At</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{k.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(k.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(k.expiresAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteConfirmId(k.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 mr-1 inline-block" />
                            Revoke
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleRevoke}
        title="Revoke API Key"
        message="Are you sure you want to revoke this API key? Any applications or integrations using this key will immediately lose access. This action cannot be undone."
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        variant="danger"
        loading={isRevoking}
      />

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
