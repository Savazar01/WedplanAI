"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface FieldHelpProps {
  message: string;
}

export function FieldHelp({ message }: FieldHelpProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center ml-2 align-middle z-10"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-[#6771ab] transition-colors cursor-help" />
      
      {showTooltip && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-[#eef0f7] dark:bg-slate-800 text-[#1c1b1f] dark:text-slate-100 text-sm rounded-lg shadow-lg border border-border animate-in fade-in zoom-in duration-200"
          role="tooltip"
        >
          <div className="relative z-20">
            {message}
          </div>
          <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 border-8 border-transparent border-t-[#eef0f7] dark:border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
