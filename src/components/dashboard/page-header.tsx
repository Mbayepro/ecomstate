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
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#00A884]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-[#15232D]">
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
      iconBox: "bg-[#E7F7F2] text-[#00A884]",
      borderHover: "hover:border-[#00A884]/45",
    },
    navy: {
      iconBox: "bg-[#073B35]/10 text-[#073B35]",
      borderHover: "hover:border-[#073B35]/35",
    },
    amber: {
      iconBox: "bg-amber-50 text-[#F4A340]",
      borderHover: "hover:border-[#F4A340]/50",
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
        "card-motion group rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs",
        t.borderHover,
        compact ? "p-4" : "p-5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-500">{label}</p>
          <div
            className={cn(
              "mt-1.5 font-extrabold tracking-tight text-[#15232D]",
              compact ? "text-xl" : "text-2xl"
            )}
          >
            {value}
          </div>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3",
            compact ? "h-8.5 w-8.5" : "h-10.5 w-10.5",
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
