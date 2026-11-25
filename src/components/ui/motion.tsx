"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Révélation fluide au défilement (IntersectionObserver, 60fps).
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform = {
    up: "translate-y-6 opacity-0",
    left: "-translate-x-6 opacity-0",
    right: "translate-x-6 opacity-0",
    scale: "scale-95 opacity-0",
  }[direction];

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        visible
          ? "translate-x-0 translate-y-0 scale-100 opacity-100"
          : hiddenTransform,
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Compteur numérique fluide pour les KPIs du dashboard et les statistiques.
 */
export function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  durationMs = 650,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const startVal = prevRef.current;
    const diff = value - startVal;
    if (diff === 0) {
      setDisplay(value);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + diff * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prevRef.current = value;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs]);

  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(display);

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
