import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error = false, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`bg-white border text-sm rounded-xl px-3 pr-10 h-10 w-full outline-none appearance-none focus-visible:ring-2 focus-visible:ring-[#6771ab] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-[#ef4444] focus-visible:ring-[#ef4444]" : "border-slate-200"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";
