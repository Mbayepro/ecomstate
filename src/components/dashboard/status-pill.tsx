import React from "react";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  Clock,
  PackageCheck,
  RotateCcw,
  Sparkles,
  Truck,
  UserCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COD_FINANCIAL_STATUS_META,
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABELS,
} from "@/lib/permissions";
import type {
  CodFinancialStatus,
  OrderStatus,
  PaymentMethodCode,
} from "@/types/domain";

const STATUS_STYLES: Record<
  OrderStatus,
  {
    wrapper: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  new: {
    wrapper: "bg-[#E7F7F2] text-[#073B35] border-[#00A884]/30",
    dot: "bg-[#00A884]",
    icon: Sparkles,
  },
  pending_confirmation: {
    wrapper: "bg-amber-50 text-amber-900 border-[#F4A340]/40",
    dot: "bg-[#F4A340]",
    icon: Clock,
  },
  confirmed: {
    wrapper: "bg-[#073B35]/10 text-[#073B35] border-[#073B35]/20",
    dot: "bg-[#073B35]",
    icon: CheckCircle2,
  },
  preparing: {
    wrapper: "bg-slate-100 text-[#15232D] border-slate-300/80",
    dot: "bg-[#15232D]",
    icon: PackageCheck,
  },
  ready_to_ship: {
    wrapper: "bg-sky-50 text-sky-800 border-sky-200/90",
    dot: "bg-sky-500",
    icon: Box,
  },
  assigned_courier: {
    wrapper: "bg-indigo-50 text-indigo-800 border-indigo-200/90",
    dot: "bg-indigo-500",
    icon: UserCheck,
  },
  shipped: {
    wrapper: "bg-cyan-50 text-cyan-800 border-cyan-200/90",
    dot: "bg-cyan-500",
    icon: Truck,
  },
  delivered: {
    wrapper: "bg-[#E7F7F2] text-[#073B35] border-[#00A884]/40",
    dot: "bg-[#00A884]",
    icon: CheckCircle2,
  },
  delivery_failed: {
    wrapper: "bg-rose-50 text-rose-800 border-rose-200/90",
    dot: "bg-rose-500",
    icon: AlertTriangle,
  },
  returned: {
    wrapper: "bg-amber-50 text-amber-900 border-[#F4A340]/50",
    dot: "bg-[#F4A340]",
    icon: RotateCcw,
  },
  cancelled: {
    wrapper: "bg-rose-50 text-rose-800 border-rose-200/90",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

export function OrderStatusPill({
  status,
  showIcon = false,
  className,
}: {
  status: OrderStatus;
  showIcon?: boolean;
  className?: string;
}) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  const meta = ORDER_STATUS_META[status] ?? ORDER_STATUS_META.new;
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap",
        style.wrapper,
        className
      )}
    >
      {showIcon ? (
        <Icon className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} />
      )}
      {meta.label}
    </span>
  );
}

const COD_FINANCE_STYLES: Record<CodFinancialStatus, string> = {
  uncollected: "bg-slate-100 text-slate-700 border-slate-200",
  expected: "bg-amber-50 text-amber-900 border-[#F4A340]/40",
  collected_by_courier: "bg-sky-50 text-sky-800 border-sky-200",
  partially_remitted: "bg-amber-50 text-amber-900 border-[#F4A340]/50",
  remitted: "bg-[#E7F7F2] text-[#073B35] border-[#00A884]/35",
  discrepancy: "bg-rose-50 text-rose-800 border-rose-200",
};

export function CodFinancialStatusPill({
  status = "expected",
  className,
}: {
  status?: CodFinancialStatus;
  className?: string;
}) {
  const meta =
    COD_FINANCIAL_STATUS_META[status] ?? COD_FINANCIAL_STATUS_META.expected;
  const style = COD_FINANCE_STYLES[status] ?? COD_FINANCE_STYLES.expected;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap",
        style,
        className
      )}
    >
      <Wallet className="h-3 w-3 shrink-0" />
      {meta.label}
    </span>
  );
}

export function PaymentMethodPill({
  method,
  compact = false,
}: {
  method: PaymentMethodCode;
  compact?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[11px] font-medium text-[#15232D]">
      <Truck className="h-3 w-3 text-[#00A884]" />
      <span>{compact ? "COD · À la livraison" : PAYMENT_METHOD_LABELS[method]}</span>
    </span>
  );
}
