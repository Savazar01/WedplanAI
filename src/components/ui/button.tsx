import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "error";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-[#6771ab]";
    
    const variants = {
      primary: "rounded-xl bg-[#6771ab] text-white shadow-md hover:bg-[#566198]",
      secondary: "rounded-xl bg-[#8b93c5] text-white shadow-md hover:bg-[#7a81b4]",
      ghost: "rounded-xl bg-transparent hover:bg-slate-100",
      error: "rounded-xl bg-[#ef4444] text-white shadow-md hover:bg-red-600",
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-base",
      icon: "h-8 w-8",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
