"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/fonctionnalites", label: "Fonctionnalités" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/a-propos", label: "À propos" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function MarketingNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-200",
        scrolled
          ? "border-white/10 bg-[#0B1F33]/95 shadow-lg backdrop-blur-md"
          : "border-white/10 bg-[#102A43]/95 backdrop-blur-xs"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo light />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-white/12 text-white"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-white/15 bg-white/8 text-white hover:border-[#10B981]/50 hover:bg-white/15"
            >
              <LayoutDashboard className="h-4 w-4 text-[#10B981]" />
              Démo
            </Button>
          </Link>
          <Link href="/connexion">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-200 hover:bg-white/10 hover:text-white"
            >
              Connexion
            </Button>
          </Link>
          <Link href="/creer-une-boutique">
            <Button variant="primary" size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              Créer ma boutique
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white transition-colors hover:bg-white/10 lg:hidden cursor-pointer"
          aria-label="Ouvrir le menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-page-enter border-t border-white/10 bg-[#0B1F33] px-4 py-4 shadow-xl lg:hidden">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-white/12 text-white"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Button
                variant="outline"
                className="w-full border-white/15 bg-white/8 text-white hover:bg-white/15"
              >
                <LayoutDashboard className="h-4 w-4 text-[#10B981]" />
                Tableau de bord Démo
              </Button>
            </Link>
            <Link href="/connexion" onClick={() => setOpen(false)}>
              <Button
                variant="outline"
                className="w-full border-white/15 bg-transparent text-slate-200 hover:bg-white/10"
              >
                Connexion
              </Button>
            </Link>
            <Link href="/creer-une-boutique" onClick={() => setOpen(false)}>
              <Button variant="primary" className="w-full">
                Créer ma boutique
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
