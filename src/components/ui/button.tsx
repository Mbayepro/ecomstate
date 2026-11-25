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
        "bg-[#00A884] text-white hover:bg-[#008F6F] focus-visible:ring-[#00A884] shadow-xs hover:shadow-md hover:shadow-[#00A884]/25",
      secondary:
        "bg-[#073B35] text-white hover:bg-[#0B5249] focus-visible:ring-[#073B35] shadow-xs hover:shadow-md hover:shadow-[#073B35]/20",
      outline:
        "border border-[#D5E3DF] bg-white text-[#15232D] hover:border-[#073B35]/35 hover:bg-[#E7F7F2]/50 focus-visible:ring-[#073B35]",
      ghost:
        "bg-transparent text-[#15232D] hover:bg-[#E7F7F2] focus-visible:ring-[#073B35]",
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
