import * as React from "react";
import { Sparkles, AlignLeft, FileText, Heart, MessageSquarePlus, Loader2, Check, Plus, AlertCircle } from "lucide-react";
import { generateAIContentAction } from "@/app/actions/llm";
import { Button } from "./button";
import { Dialog } from "./dialog";

interface AIAssistantButtonProps {
  value: string;
  onApply: (newText: string, mode: "replace" | "append") => void;
  title?: string;
  disabled?: boolean;
}

export const AIAssistantButton: React.FC<AIAssistantButtonProps> = ({
  value,
  onApply,
  title = "field",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [promptMode, setPromptMode] = React.useState<"enhance" | "summarize" | "elaborate" | "romantic" | "custom" | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [generatedText, setGeneratedText] = React.useState("");
  const [error, setError] = React.useState("");
  const [customPromptText, setCustomPromptText] = React.useState("");

  const isTextEmpty = !value || !value.trim();

  const handleSelectOption = async (mode: "enhance" | "summarize" | "elaborate" | "romantic" | "custom") => {
    setIsOpen(false);
    setPromptMode(mode);
    setError("");
    setGeneratedText("");
    
    if (mode === "custom") {
      setCustomPromptText("");
      setIsModalOpen(true);
      return;
    }

    // For other modes, run immediately
    setIsModalOpen(true);
    await triggerGeneration(mode, value);
  };

  const triggerGeneration = async (
    mode: "enhance" | "summarize" | "elaborate" | "romantic" | "custom",
    textToProcess: string,
    customPromptInput?: string
  ) => {
    setLoading(true);
    setError("");
    try {
      let prompt = "";
      const systemPrompt = "You are a helpful wedding planning AI assistant. Your response should contain ONLY the requested content, without any conversational filler, quotes, introductory phrases, or explanations. Keep the formatting clean.";

      switch (mode) {
        case "enhance":
          prompt = `Enhance and polish the following text. Make it clearer, more professional, and well-written. Do not add any introductory or concluding remarks. Return ONLY the final enhanced text:\n\n${textToProcess}`;
          break;
        case "summarize":
          prompt = `Summarize the following text briefly and concisely. Do not add any introductory or concluding remarks. Return ONLY the final summary:\n\n${textToProcess}`;
          break;
        case "elaborate":
          prompt = `Elaborate and expand on the following text. Add more details and depth to make it more comprehensive and engaging. Do not add any introductory or concluding remarks. Return ONLY the final expanded text:\n\n${textToProcess}`;
          break;
        case "romantic":
          prompt = `Rewrite the following text to sound romantic, warm, and beautiful, suitable for a wedding. Do not add any introductory or concluding remarks. Return ONLY the final rewritten text:\n\n${textToProcess}`;
          break;
        case "custom":
          prompt = `Target text: "${textToProcess}"\n\nInstruction: ${customPromptInput}\n\nExecute the instruction on the target text. If the target text is empty, generate new content based on the instruction. Do not add any introductory or concluding remarks. Return ONLY the final result.`;
          break;
      }

      const res = await generateAIContentAction(prompt, systemPrompt);
      if (res && "error" in res && res.error) {
        setError(res.error);
      } else if (res && "text" in res && res.text) {
        setGeneratedText(res.text.trim());
      } else {
        setError("Failed to generate content.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (mode: "replace" | "append") => {
    onApply(generatedText, mode);
    setIsModalOpen(false);
    setPromptMode(null);
    setGeneratedText("");
  };

  const getModalTitle = () => {
    switch (promptMode) {
      case "enhance": return `Enhance: ${title}`;
      case "summarize": return `Summarize: ${title}`;
      case "elaborate": return `Elaborate: ${title}`;
      case "romantic": return `Make it Romantic: ${title}`;
      case "custom": return `Custom Prompt: ${title}`;
      default: return "AI Assistant";
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#6771ab] bg-[#eef0f7] hover:bg-[#8b93c5] hover:text-white transition-all active:scale-[0.97] outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        title="AI Assistant"
      >
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#6771ab] hover:text-white" />
        <span>AI Assistant</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg z-50 py-1 font-sans">
            <button
              type="button"
              disabled={isTextEmpty}
              onClick={() => handleSelectOption("enhance")}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-[#f0f1fa] hover:text-[#3d4580] flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-700 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#6771ab]" />
              Enhance
            </button>
            <button
              type="button"
              disabled={isTextEmpty}
              onClick={() => handleSelectOption("summarize")}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-[#f0f1fa] hover:text-[#3d4580] flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-700 disabled:cursor-not-allowed cursor-pointer"
            >
              <AlignLeft className="h-3.5 w-3.5 text-[#6771ab]" />
              Summarize
            </button>
            <button
              type="button"
              disabled={isTextEmpty}
              onClick={() => handleSelectOption("elaborate")}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-[#f0f1fa] hover:text-[#3d4580] flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-700 disabled:cursor-not-allowed cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-[#6771ab]" />
              Elaborate
            </button>
            <button
              type="button"
              disabled={isTextEmpty}
              onClick={() => handleSelectOption("romantic")}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-[#f0f1fa] hover:text-[#3d4580] flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-700 disabled:cursor-not-allowed cursor-pointer"
            >
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-50" />
              Make it Romantic
            </button>
            <div className="border-t border-slate-100 my-1" />
            <button
              type="button"
              onClick={() => handleSelectOption("custom")}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-[#f0f1fa] hover:text-[#3d4580] flex items-center gap-2 cursor-pointer font-medium"
            >
              <MessageSquarePlus className="h-3.5 w-3.5 text-[#6771ab]" />
              Custom Prompt
            </button>
          </div>
        </>
      )}

      <Dialog
        isOpen={isModalOpen}
        onClose={() => {
          if (!loading) {
            setIsModalOpen(false);
            setPromptMode(null);
          }
        }}
        title={getModalTitle()}
      >
        <div className="space-y-4 font-sans py-1">
          {promptMode === "custom" && !generatedText && !loading && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider mb-1.5">
                  Describe what you want the AI to generate:
                </label>
                <textarea
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  placeholder="e.g. Write a warm and welcoming introduction to our wedding page..."
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab] focus:border-[#6771ab]"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsModalOpen(false);
                    setPromptMode(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => triggerGeneration("custom", value, customPromptText)}
                  disabled={!customPromptText.trim()}
                  className="bg-[#6771ab] hover:bg-[#566198] text-white"
                >
                  Generate
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="h-8 w-8 text-[#6771ab] animate-spin" />
              <span className="text-sm font-medium text-slate-500">
                AI is crafting content for you...
              </span>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <div className="space-y-1">
                  <p className="font-semibold">Generation Failed</p>
                  <p className="text-red-500/90">{error}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsModalOpen(false);
                    setPromptMode(null);
                  }}
                >
                  Close
                </Button>
                {promptMode !== "custom" ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => triggerGeneration(promptMode!, value)}
                    className="bg-[#6771ab] hover:bg-[#566198] text-white"
                  >
                    Try Again
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => triggerGeneration("custom", value, customPromptText)}
                    className="bg-[#6771ab] hover:bg-[#566198] text-white"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          )}

          {generatedText && !loading && !error && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
                  Generated Preview
                </label>
                <div className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-3 text-sm text-slate-800 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {generatedText}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (promptMode === "custom") {
                      setGeneratedText("");
                    } else {
                      setIsModalOpen(false);
                      setPromptMode(null);
                      setGeneratedText("");
                    }
                  }}
                >
                  {promptMode === "custom" ? "Back to Prompt" : "Cancel"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="bg-[#8b93c5] hover:bg-[#7a81b4] text-white"
                    onClick={() => handleApply("append")}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Append
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="bg-[#6771ab] hover:bg-[#566198] text-white"
                    onClick={() => handleApply("replace")}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Replace
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};
