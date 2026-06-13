import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`bg-white border text-sm rounded-xl px-3 h-10 w-full outline-none focus-visible:ring-2 focus-visible:ring-[#6771ab] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? "border-[#ef4444] focus-visible:ring-[#ef4444]" : "border-slate-200"
        } ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
