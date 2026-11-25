"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  BookOpen,
  Bug,
  CheckCircle2,
  HelpCircle,
  LifeBuoy,
  MessageSquarePlus,
  Send,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { usePlatform } from "@/lib/platform-store";
import { formatDate } from "@/lib/utils";

interface SupportTicket {
  id: string;
  subject: string;
  category: "question" | "bug" | "abonnement" | "domaine";
  message: string;
  status: "open" | "answered";
  createdAt: string;
}

const TICKETS_STORAGE_PREFIX = "ecomsate_support_tickets_";

const GETTING_STARTED_STEPS = [
  {
    step: "1",
    title: "Personnalisez votre vitrine (Store Builder)",
    desc: "Choisissez votre thème Shrine Pro 1 ou Shrine Pro 3, importez votre logo et ajustez vos sections.",
    href: "/dashboard/store-builder",
  },
  {
    step: "2",
    title: "Configurez votre formulaire 100 % COD",
    desc: "Adaptez les champs demandés à vos clients (téléphone, ville, quartier, repère) et vos offres Packs.",
    href: "/dashboard/form-builder",
  },
  {
    step: "3",
    title: "Ajoutez vos produits et coûts d'achat",
    desc: "Renseignez vos prix de vente et prix d'achat pour suivre automatiquement votre marge nette.",
    href: "/dashboard/produits",
  },
  {
    step: "4",
    title: "Confirmez, livrez et rapprochez le cash COD",
    desc: "Appelez vos clients, assignez vos livreurs et validez leurs versements dans votre caisse.",
    href: "/dashboard/commandes",
  },
];

export default function DashboardSupportPage() {
  const { activeStore } = usePlatform();
  const [activeTab, setActiveTab] = useState<"guide" | "tickets">("guide");
  const [subject, setSubject] = useState("");
  const [category, setCategory] =
    useState<SupportTicket["category"]>("question");
  const [message, setMessage] = useState("");
  const [sentNotice, setSentNotice] = useState(false);

  const storageKey = activeStore
    ? `${TICKETS_STORAGE_PREFIX}${activeStore.id}`
    : "";

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    if (typeof window === "undefined" || !activeStore) return [];
    try {
      const raw = window.localStorage.getItem(
        `${TICKETS_STORAGE_PREFIX}${activeStore.id}`
      );
      return raw ? (JSON.parse(raw) as SupportTicket[]) : [];
    } catch {
      return [];
    }
  });

  if (!activeStore) return null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    const nextTicket: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject.trim(),
      category,
      message: message.trim(),
      status: "open",
      createdAt: new Date().toISOString(),
    };
    const updated = [nextTicket, ...tickets];
    setTickets(updated);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setSubject("");
    setMessage("");
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Centre d'aide & Assistance commerçant"
        title="Support, Guide & Tickets"
        description="Retrouvez le guide de démarrage rapide, posez une question à Adeshina IA ou ouvrez un ticket auprès du support EcomSate."
        actions={
          <Link href="/dashboard/adeshina-ia">
            <Button variant="primary" size="sm">
              <Sparkles className="h-4 w-4" />
              Demander à Adeshina IA
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "guide"
              ? "bg-[#073B35] text-white shadow-2xs"
              : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
          }`}
        >
          <BookOpen className="h-4 w-4 text-[#00A884]" />
          1. Guide de démarrage & Tutoriels
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tickets")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "tickets"
              ? "bg-[#073B35] text-white shadow-2xs"
              : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
          }`}
        >
          <LifeBuoy className="h-4 w-4 text-[#00A884]" />
          2. Ouvrir un ticket / Signaler un bug ({tickets.length})
        </button>
      </div>

      {activeTab === "guide" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {GETTING_STARTED_STEPS.map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className="card-motion flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 hover:border-[#00A884]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#073B35] text-xs font-extrabold text-white">
                    {item.step}
                  </span>
                  <Badge variant="success">Étape clé</Badge>
                </div>
                <h3 className="mt-3 text-sm font-extrabold text-[#15232D]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-[#00A884]">
                Ouvrir ce module →
              </span>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "tickets" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="border-[#E2E8F0] bg-white lg:col-span-6">
            <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#15232D]">
                <MessageSquarePlus className="h-4 w-4 text-[#00A884]" />
                Nouvelle demande d&apos;assistance ou signalement de bug
              </h2>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#15232D]">
                    Type de demande
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as SupportTicket["category"])
                    }
                    className="h-10.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#15232D]"
                  >
                    <option value="question">Question sur l&apos;utilisation</option>
                    <option value="bug">Signaler un bug technique</option>
                    <option value="abonnement">Abonnement Standard / Premium</option>
                    <option value="domaine">Nom de domaine personnalisé</option>
                  </select>
                </div>

                <Input
                  label="Sujet de votre demande *"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : Aide sur le rapprochement livreur"
                />

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#15232D]">
                    Description détaillée *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décrivez votre besoin..."
                    className="w-full rounded-xl border border-[#E2E8F0] p-3 text-xs focus:border-[#00A884] focus:outline-none"
                  />
                </div>

                {sentNotice && (
                  <div className="flex items-center gap-2 rounded-xl bg-[#E7F7F2] p-3 text-xs font-bold text-[#073B35]">
                    <CheckCircle2 className="h-4 w-4 text-[#00A884]" />
                    Ticket enregistré ! Notre équipe support vous répondra sous
                    peu.
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full">
                  <Send className="h-4 w-4" />
                  Envoyer le ticket au support EcomSate
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-[#E2E8F0] bg-white lg:col-span-6">
            <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#15232D]">
                <HelpCircle className="h-4 w-4 text-[#00A884]" />
                Historique de vos tickets ({tickets.length})
              </h2>
            </CardHeader>
            <CardContent className="p-5">
              {tickets.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  <Bug className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  Aucun ticket ouvert pour {activeStore.name}.
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-[#15232D]">
                          {t.id} · {t.subject}
                        </span>
                        <Badge variant="warning">En cours</Badge>
                      </div>
                      <p className="mt-1.5 text-slate-600">{t.message}</p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        Créé le {formatDate(t.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
