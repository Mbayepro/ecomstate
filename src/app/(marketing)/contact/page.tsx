"use client";

import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="success">Contact</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Parlons de votre boutique
          </h1>
          <p className="mt-3 text-base text-slate-300">
            Notre équipe répond aux commerçants et partenaires sous 24 heures.
          </p>
        </div>


        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <div className="space-y-4 md:col-span-5">
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-[#00A884]" />
                  <div>
                    <p className="text-sm font-semibold text-[#073B35]">E-mail</p>
                    <p className="text-sm text-slate-600">support@ecomsate.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-[#00A884]" />
                  <div>
                    <p className="text-sm font-semibold text-[#073B35]">
                      WhatsApp & Support Direct (Bénin)
                    </p>
                    <a
                      href="https://wa.me/22995782132?text=Bonjour%20EcomSate%2C%20je%20souhaite%20des%20informations%20sur%20la%20plateforme."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-block text-sm font-semibold text-[#00A884] hover:underline"
                    >
                      +229 95 78 21 32 (Discuter sur WhatsApp)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-[#00A884]" />
                  <div>
                    <p className="text-sm font-semibold text-[#073B35]">
                      Zones couvertes
                    </p>
                    <p className="text-sm text-slate-600">
                      Bénin, Sénégal, Côte d&apos;Ivoire, Togo, Burkina Faso
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-7">
            <Card>
              <CardContent className="p-6">
                {sent ? (
                  <div className="py-10 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-[#00A884]" />
                    <h2 className="mt-4 text-xl font-bold text-[#073B35]">
                      Message envoyé
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Merci de nous avoir contactés. Notre équipe vous répondra
                      très rapidement.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setSent(false)}
                    >
                      Envoyer un autre message
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSent(true);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Nom complet" required placeholder="Votre nom" />
                      <Input
                        label="Adresse e-mail"
                        type="email"
                        required
                        placeholder="vous@exemple.com"
                      />
                    </div>
                    <Input
                      label="Téléphone / WhatsApp"
                      placeholder="+229 95 78 21 32"
                    />

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#073B35]">
                        Message
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Comment pouvons-nous vous aider ?"
                        className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#15232D] focus:border-[#073B35] focus:outline-none focus:ring-2 focus:ring-[#073B35]/15"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="w-full">
                      Envoyer le message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
