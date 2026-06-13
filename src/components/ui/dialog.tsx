import * as React from "react";
import { Card } from "./card";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-lg bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-[#6771ab]">
              {title}
            </h3>
          )}
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 outline-none"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {children}
        </div>
      </Card>
    </div>
  );
};
