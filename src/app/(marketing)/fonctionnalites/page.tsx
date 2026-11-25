import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Globe,
  Layers,
  MessageCircle,
  Package,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const MODULES = [
  {
    icon: Package,
    title: "Gestion complète des produits",
    items: [
      "Photos multiples et descriptions détaillées",
      "Prix standard et prix promotionnel barré",
      "Variantes (tailles, couleurs, pointures)",
      "Activation ou désactivation en un clic",
    ],
  },
  {
    icon: Layers,
    title: "Stocks & Alertes automatiques",
    items: [
      "Suivi des quantités disponibles en temps réel",
      "Décrémentation automatique lors des commandes",
      "Alertes visuelles de stock faible et ruptures",
      "Historique complet des mouvements de stock",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Gestion des commandes",
    items: [
      "Numéro de commande unique généré automatiquement",
      "7 statuts : Nouvelle, En attente, Confirmée, Préparation, Expédiée, Livrée, Annulée",
      "Coordonnées client et adresse de livraison centralisées",
      "Détail du moyen de paiement et référence",
    ],
  },
  {
    icon: MessageCircle,
    title: "Paiements adaptés au marché africain",
    items: [
      "Paiement à la livraison (Cash on Delivery)",
      "Commande rapide pré-remplie sur WhatsApp",
      "Paiement manuel Mobile Money avec validation vendeur",
      "Architecture prête pour Wave, Orange Money, MTN MoMo, Moov",
    ],
  },
  {
    icon: Palette,
    title: "Personnalisation sans code",
    items: [
      "Logo, bannière, couleurs principale et secondaire",
      "Modèles de boutique au choix (Minimal, Boutique, Éditorial)",
      "Liens réseaux sociaux, livraison et conditions de vente",
      "Identité totalement indépendante d'EcomSate",
    ],
  },
  {
    icon: Globe,
    title: "Sous-domaines & Domaines Premium",
    items: [
      "Sous-domaine gratuit attribué dès l'inscription",
      "Connexion d'un domaine existant ou achat via EcomSate (Premium)",
      "Certificat SSL (HTTPS) automatique",
      "Propriété complète du domaine pour le commerçant",
    ],
  },
  {
    icon: Users,
    title: "Fichier clients & fidélisation",
    items: [
      "Annuaire automatique de tous vos acheteurs",
      "Téléphone, e-mail et adresses de livraison",
      "Historique complet des commandes et total dépensé",
    ],
  },
  {
    icon: BarChart3,
    title: "Tableau de bord & pilotage",
    items: [
      "Chiffre d'affaires, commandes livrées et en attente",
      "Filtrage des indicateurs par période",
      "Vue immédiate des produits en rupture de stock",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Sécurité & Isolation multi-tenant",
    items: [
      "Isolation stricte des données entre boutiques (RLS)",
      "Aucune fuite possible entre commerçants",
      "Journalisation des opérations sensibles",
    ],
  },
];

export default function FonctionnalitesPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="success">Fonctionnalités</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#102A43]">
            Une plateforme complète pour vendre en ligne en Afrique
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Chaque outil a été pensé pour les réalités quotidiennes des
            commerçants : rapidité sur mobile, commandes WhatsApp, gestion des
            stocks et indépendance de marque.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.title}>
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#102A43] text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-[#102A43]">
                    {m.title}
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {m.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10B981]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-14 rounded-2xl bg-[#102A43] p-8 text-center text-white">
          <h2 className="text-2xl font-bold text-white">
            Prêt à tester EcomSate sur votre propre boutique ?
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Activez votre espace pour 2 000 FCFA et profitez de 30 jours
            d&apos;essai complet.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/creer-une-boutique">
              <Button variant="primary" size="lg">
                Créer ma boutique
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/s/atelier-dakar">
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Voir une boutique démo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
