import React from "react";
import { cn } from "@/lib/utils";

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-5 sm:flex-row sm:items-center">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-[#102A43]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
}

export function StatMetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = "navy",
  action,
  compact = false,
}: {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "emerald" | "navy" | "amber" | "sky" | "rose" | "slate";
  action?: React.ReactNode;
  compact?: boolean;
}) {
  const toneStyles: Record<
    NonNullable<typeof tone>,
    { iconBox: string; borderHover: string }
  > = {
    emerald: {
      iconBox: "bg-[#10B981]/10 text-[#10B981]",
      borderHover: "hover:border-[#10B981]/40",
    },
    navy: {
      iconBox: "bg-[#102A43]/8 text-[#102A43]",
      borderHover: "hover:border-[#102A43]/30",
    },
    amber: {
      iconBox: "bg-amber-50 text-amber-600",
      borderHover: "hover:border-amber-300",
    },
    sky: {
      iconBox: "bg-sky-50 text-sky-600",
      borderHover: "hover:border-sky-300",
    },
    rose: {
      iconBox: "bg-rose-50 text-rose-600",
      borderHover: "hover:border-rose-300",
    },
    slate: {
      iconBox: "bg-slate-100 text-slate-500",
      borderHover: "hover:border-slate-300",
    },
  };

  const t = toneStyles[tone];

  return (
    <div
      className={cn(
        "group rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs transition-all duration-200",
        t.borderHover,
        compact ? "p-4" : "p-5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          <div
            className={cn(
              "mt-1.5 font-extrabold tracking-tight text-[#102A43]",
              compact ? "text-xl" : "text-2xl"
            )}
          >
            {value}
          </div>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
            compact ? "h-8.5 w-8.5" : "h-10 w-10",
            t.iconBox
          )}
        >
          <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </span>
      </div>

      {(subtext || action) && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <div className="truncate">{subtext}</div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </div>
  );
}
