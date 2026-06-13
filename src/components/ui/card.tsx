import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "cream" | "elevated";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles = "rounded-2xl border transition-shadow duration-200";
    
    const variants = {
      default: "bg-white border-slate-200 shadow-sm",
      cream: "bg-[#fefce8] border-slate-200 shadow-sm hover:shadow-md",
      elevated: "bg-white border-slate-100 shadow-md hover:shadow-lg",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
