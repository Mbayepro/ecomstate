import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "navy";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-[#15232D] border-slate-200",
  success: "bg-[#E7F7F2] text-[#073B35] border-[#00A884]/30",
  warning: "bg-[#F4A340]/15 text-[#9A5806] border-[#F4A340]/40",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-[#E7F7F2]/70 text-[#008F6F] border-[#00A884]/25",
  navy: "bg-[#073B35]/10 text-[#073B35] border-[#073B35]/20",
};


export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
