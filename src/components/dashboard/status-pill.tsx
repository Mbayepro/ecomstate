import React from "react";
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  PackageCheck,
  Smartphone,
  Sparkles,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_META, PAYMENT_METHOD_LABELS } from "@/lib/permissions";
import type { OrderStatus, PaymentMethodCode } from "@/types/domain";

const STATUS_STYLES: Record<
  OrderStatus,
  {
    wrapper: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  new: {
    wrapper: "bg-sky-50 text-sky-800 border-sky-200/90",
    dot: "bg-sky-500",
    icon: Sparkles,
  },
  pending_confirmation: {
    wrapper: "bg-amber-50 text-amber-800 border-amber-200/90",
    dot: "bg-amber-500",
    icon: Clock,
  },
  confirmed: {
    wrapper: "bg-[#102A43]/8 text-[#102A43] border-[#102A43]/20",
    dot: "bg-[#102A43]",
    icon: CheckCircle2,
  },
  preparing: {
    wrapper: "bg-indigo-50 text-indigo-800 border-indigo-200/90",
    dot: "bg-indigo-500",
    icon: PackageCheck,
  },
  shipped: {
    wrapper: "bg-cyan-50 text-cyan-800 border-cyan-200/90",
    dot: "bg-cyan-500",
    icon: Truck,
  },
  delivered: {
    wrapper: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
    dot: "bg-[#10B981]",
    icon: CheckCircle2,
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
  const style = STATUS_STYLES[status];
  const meta = ORDER_STATUS_META[status];
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

export function PaymentMethodPill({
  method,
  compact = false,
}: {
  method: PaymentMethodCode;
  compact?: boolean;
}) {
  const Icon =
    method === "whatsapp_order"
      ? MessageCircle
      : method === "manual_mobile_money"
      ? Smartphone
      : Truck;

  const shortLabel =
    method === "whatsapp_order"
      ? "WhatsApp"
      : method === "manual_mobile_money"
      ? "Mobile Money"
      : "À la livraison";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[11px] font-medium text-slate-600">
      <Icon className="h-3 w-3 text-[#102A43]" />
      <span>{compact ? shortLabel : PAYMENT_METHOD_LABELS[method]}</span>
    </span>
  );
}
