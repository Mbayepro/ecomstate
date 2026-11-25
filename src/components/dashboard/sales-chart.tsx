"use client";

import React, { useMemo, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "@/types/domain";

interface ChartBucket {
  key: string;
  label: string;
  fullDate: string;
  revenue: number;
  ordersCount: number;
}

export function SalesInteractiveChart({
  orders,
  currency,
}: {
  orders: Order[];
  currency: string;
}) {
  const [chartType, setChartType] = useState<"area" | "bars">("area");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Agrégation 100 % issue des vraies commandes non annulées
  const buckets = useMemo<ChartBucket[]>(() => {
    const valid = orders
      .filter((o) => o.status !== "cancelled")
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    const byDay = new Map<string, ChartBucket>();

    for (const ord of valid) {
      const d = new Date(ord.createdAt);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;

      const shortLabel = new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
      }).format(d);

      const fullDate = new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(d);

      const existing = byDay.get(dayKey);
      if (existing) {
        existing.revenue += ord.totalAmount;
        existing.ordersCount += 1;
      } else {
        byDay.set(dayKey, {
          key: dayKey,
          label: shortLabel,
          fullDate,
          revenue: ord.totalAmount,
          ordersCount: 1,
        });
      }
    }

    return Array.from(byDay.values()).slice(-10);
  }, [orders]);

  const maxRevenue = useMemo(
    () => Math.max(...buckets.map((b) => b.revenue), 1),
    [buckets]
  );

  const selectedBucket =
    activeIdx !== null && buckets[activeIdx]
      ? buckets[activeIdx]
      : buckets[buckets.length - 1] ?? null;

  if (buckets.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC]/60 p-6 text-center">
        <BarChart3 className="h-8 w-8 text-slate-300" />
        <p className="mt-2.5 text-sm font-semibold text-[#073B35]">
          Aucune vente validée sur cette période
        </p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Dès que votre boutique enregistrera des commandes sur la période
          sélectionnée, leur évolution s&apos;affichera ici automatiquement.
        </p>
      </div>
    );
  }

  // Coordonnées SVG normalisées (viewBox 600 x 200)
  const width = 600;
  const height = 190;
  const padX = 28;
  const padTop = 18;
  const padBottom = 26;
  const usableW = width - padX * 2;
  const usableH = height - padTop - padBottom;

  const points = buckets.map((b, i) => {
    const x =
      buckets.length === 1
        ? width / 2
        : padX + (i / (buckets.length - 1)) * usableW;
    const y = padTop + usableH - (b.revenue / maxRevenue) * usableH;
    return { x, y, bucket: b, index: i };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
          padTop + usableH
        ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(
          padTop + usableH
        ).toFixed(1)} Z`
      : "";

  return (
    <div className="space-y-4">
      {/* Barre d'info interactive + sélecteur de vue */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
        {selectedBucket ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="text-xs font-medium capitalize text-slate-500">
              {selectedBucket.fullDate}
            </span>
            <span className="text-sm font-extrabold text-[#073B35]">
              {formatCurrency(selectedBucket.revenue, currency)}
            </span>
            <span className="rounded-full bg-[#00A884]/12 px-2 py-0.5 text-[11px] font-semibold text-[#00A884]">
              {selectedBucket.ordersCount} commande
              {selectedBucket.ordersCount > 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">
            Survolez un point pour afficher le détail
          </span>
        )}

        <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-white p-0.5">
          <button
            type="button"
            onClick={() => setChartType("area")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              chartType === "area"
                ? "bg-[#073B35] text-white"
                : "text-slate-500 hover:text-[#073B35]"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Courbe
          </button>
          <button
            type="button"
            onClick={() => setChartType("bars")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              chartType === "bars"
                ? "bg-[#073B35] text-white"
                : "text-slate-500 hover:text-[#073B35]"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Barres
          </button>
        </div>
      </div>

      {/* Zone graphique */}
      {chartType === "area" ? (
        <div
          className="relative w-full overflow-hidden pt-1"
          onMouseLeave={() => setActiveIdx(null)}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-52 w-full overflow-visible"
            role="img"
            aria-label="Graphique d'évolution du chiffre d'affaires"
          >
            {/* Lignes horizontales de repère */}
            {[0, 0.5, 1].map((ratio) => {
              const y = padTop + usableH * ratio;
              return (
                <line
                  key={ratio}
                  x1={padX}
                  x2={width - padX}
                  y1={y}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Remplissage discret sous la courbe */}
            {areaPath && <path d={areaPath} fill="#00A884" fillOpacity="0.1" />}

            {/* Ligne principale */}
            {points.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#00A884"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Ligne verticale active */}
            {activeIdx !== null && points[activeIdx] && (
              <line
                x1={points[activeIdx].x}
                x2={points[activeIdx].x}
                y1={padTop}
                y2={padTop + usableH}
                stroke="#073B35"
                strokeOpacity="0.2"
                strokeWidth="1.5"
              />
            )}

            {/* Points interactifs */}
            {points.map((pt) => {
              const isSelected =
                activeIdx === pt.index ||
                (activeIdx === null && pt.index === points.length - 1);
              return (
                <g
                  key={pt.bucket.key}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveIdx(pt.index)}
                  onClick={() => setActiveIdx(pt.index)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={16}
                    fill="transparent"
                  />
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={9}
                      fill="#00A884"
                      fillOpacity="0.18"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 5 : 4}
                    fill={isSelected ? "#073B35" : "#FFFFFF"}
                    stroke="#00A884"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.x}
                    y={height - 4}
                    textAnchor="middle"
                    className="fill-slate-400 text-[11px] font-medium"
                  >
                    {pt.bucket.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div
          className="flex h-52 items-end gap-3 px-2 pt-4"
          onMouseLeave={() => setActiveIdx(null)}
        >
          {buckets.map((b, idx) => {
            const pct = Math.max(12, Math.round((b.revenue / maxRevenue) * 100));
            const isSelected = activeIdx === idx;
            return (
              <button
                key={b.key}
                type="button"
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => setActiveIdx(idx)}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-2 cursor-pointer"
              >
                <span className="text-[10px] font-semibold text-slate-500">
                  {Math.round(b.revenue / 1000)}k
                </span>
                <div className="flex h-36 w-full max-w-14 items-end rounded-lg bg-[#F8FAFC] p-1">
                  <div
                    className="animate-bar-grow w-full rounded-md transition-colors duration-200"
                    style={{
                      height: `${pct}%`,
                      animationDelay: `${idx * 50}ms`,
                      backgroundColor: isSelected ? "#073B35" : "#00A884",
                    }}
                  />
                </div>
                <span className="truncate text-[11px] font-medium text-slate-500">
                  {b.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
