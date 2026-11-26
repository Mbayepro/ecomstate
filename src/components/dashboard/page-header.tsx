import React from "react";
import { cn } from "@/lib/utils";
import { VoiceAudioButton } from "@/components/ui/voice-audio-button";

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
  badge,
  audioText,
}: {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "emerald" | "navy" | "amber" | "sky" | "rose" | "slate";
  action?: React.ReactNode;
  compact?: boolean;
  badge?: string;
  audioText?: string;
}) {
  const toneStyles: Record<
    NonNullable<typeof tone>,
    {
      cardBg: string;
      iconBox: string;
      borderHover: string;
      badgeBg: string;
    }
  > = {
    emerald: {
      cardBg: "hover:bg-[#E7F7F2]/25",
      iconBox: "bg-[#E7F7F2] text-[#00A884] ring-2 ring-[#00A884]/20",
      borderHover: "hover:border-[#00A884] border-[#00A884]/30",
      badgeBg: "bg-[#E7F7F2] text-[#073B35]",
    },
    navy: {
      cardBg: "hover:bg-slate-50/70",
      iconBox: "bg-[#073B35]/10 text-[#073B35] ring-2 ring-[#073B35]/15",
      borderHover: "hover:border-[#073B35]/50 border-slate-200",
      badgeBg: "bg-slate-100 text-[#073B35]",
    },
    amber: {
      cardBg: "hover:bg-amber-50/40",
      iconBox: "bg-amber-100 text-amber-700 ring-2 ring-amber-400/30",
      borderHover: "hover:border-amber-400 border-amber-200",
      badgeBg: "bg-amber-100 text-amber-800",
    },
    sky: {
      cardBg: "hover:bg-sky-50/40",
      iconBox: "bg-sky-100 text-sky-700 ring-2 ring-sky-300",
      borderHover: "hover:border-sky-400 border-sky-200",
      badgeBg: "bg-sky-100 text-sky-800",
    },
    rose: {
      cardBg: "hover:bg-rose-50/40",
      iconBox: "bg-rose-100 text-rose-700 ring-2 ring-rose-300",
      borderHover: "hover:border-rose-400 border-rose-200",
      badgeBg: "bg-rose-100 text-rose-800",
    },
    slate: {
      cardBg: "hover:bg-slate-50/50",
      iconBox: "bg-slate-100 text-slate-600 ring-2 ring-slate-200",
      borderHover: "hover:border-slate-300 border-slate-200",
      badgeBg: "bg-slate-100 text-slate-700",
    },
  };

  const t = toneStyles[tone];

  return (
    <div
      className={cn(
        "card-motion group relative flex flex-col justify-between rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        t.borderHover,
        t.cardBg,
        compact ? "p-3.5" : "p-4.5 sm:p-5"
      )}
    >
      <div>
        {/* En-tête de carte avec Badge & Bouton Vocal 1 Clic */}
        <div className="flex items-center justify-between gap-2 pb-2">
          {badge ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide",
                t.badgeBg
              )}
            >
              {badge}
            </span>
          ) : (
            <span />
          )}

          {audioText && (
            <VoiceAudioButton
              textToSpeak={audioText}
              variant="icon"
              title="Cliquer pour écouter l'explication vocale de ce chiffre"
              className="h-6 w-6 rounded-full"
            />
          )}
        </div>

        {/* Titre & Grand Symbole Visuel */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold leading-snug text-slate-600">
              {label}
            </p>
            <div
              className={cn(
                "mt-1.5 font-black tracking-tight text-[#15232D]",
                compact ? "text-xl" : "text-2xl sm:text-[26px]"
              )}
            >
              {value}
            </div>
          </div>

          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-108",
              compact ? "h-9 w-9" : "h-12 w-12",
              t.iconBox
            )}
          >
            <Icon className={compact ? "h-4.5 w-4.5" : "h-6 w-6 stroke-[2.2]"} />
          </span>
        </div>
      </div>

      {/* Ligne inférieure : sous-texte complet + action 1 clic tactile */}
      {(subtext || action) && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <div className="text-[11px] font-semibold text-slate-500 leading-tight">
            {subtext}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </div>
  );
}
