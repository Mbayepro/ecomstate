import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[#10B981] text-white hover:bg-[#059669] focus-visible:ring-[#10B981] shadow-xs hover:shadow-md hover:shadow-[#10B981]/20",
      secondary:
        "bg-[#102A43] text-white hover:bg-[#1B3B5A] focus-visible:ring-[#102A43] shadow-xs hover:shadow-md hover:shadow-[#102A43]/15",
      outline:
        "border border-[#E2E8F0] bg-white text-[#102A43] hover:border-[#102A43]/30 hover:bg-[#F8FAFC] focus-visible:ring-[#102A43]",
      ghost:
        "bg-transparent text-[#1E293B] hover:bg-[#E2E8F0]/60 focus-visible:ring-[#102A43]",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-xs",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-9 px-3.5 text-sm rounded-lg",
      md: "h-10.5 px-4.5 text-sm rounded-lg",
      lg: "h-12 px-6 text-base rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "group inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
