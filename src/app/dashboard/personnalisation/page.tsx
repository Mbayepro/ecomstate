"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  ExternalLink,
  LayoutTemplate,
  MapPin,
  Palette,
  Phone,
  Plus,
  Save,
  Smartphone,
  Trash2,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SingleImageUploadField } from "@/components/ui/image-upload-field";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

import { usePlatform } from "@/lib/platform-store";
import type { DeliveryZone, StoreTemplateId } from "@/types/domain";

const BENIN_ZONES_PRESET: DeliveryZone[] = [
  { id: "z-bj-1", name: "Cotonou Centre (Ganhi, Cadjèhoun, Fidjrossè)", fee: 1000, estimatedDelay: "1h - 2h" },
  { id: "z-bj-2", name: "Abomey-Calavi / Akpakpa / Godomey", fee: 1500, estimatedDelay: "2h - 4h" },
  { id: "z-bj-3", name: "Porto-Novo / Ouidah / Sèmè-Podji", fee: 2500, estimatedDelay: "24h" },
  { id: "z-bj-4", name: "Parakou / Bohicon / Autres villes", fee: 4000, estimatedDelay: "24h - 48h" },
];

const SENEGAL_ZONES_PRESET: DeliveryZone[] = [
  { id: "z-sn-1", name: "Dakar Centre (Plateau, Almadies, Mermoz)", fee: 1500, estimatedDelay: "2h - 4h" },
  { id: "z-sn-2", name: "Banlieue (Pikine, Guédiawaye, Rufisque)", fee: 2500, estimatedDelay: "Même jour" },
  { id: "z-sn-3", name: "Thiès, Mbour & Régions", fee: 4000, estimatedDelay: "24h - 48h" },
];


const TEMPLATES: { id: StoreTemplateId; name: string; desc: string }[] = [
  {
    id: "shrine_pro_1",
    name: "Shrine Référence (Standard)",
    desc: "Thème officiel orienté conversion COD avec bénéfices, résultats et FAQ.",
  },
  {
    id: "shrine_pro_3",
    name: "Shrine Pro 3 (Premium)",
    desc: "Offres Packs 1x/2x/3x, tableau comparatif et fiche produit COD intégrée.",
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Bannière deux colonnes et grille carrée contemporaine.",
  },
  {
    id: "boutique",
    name: "Boutique",
    desc: "Grande bannière immersive et cartes portrait élégantes.",
  },
  {
    id: "editorial",
    name: "Éditorial",
    desc: "Mise en page centrée façon magazine de marque.",
  },
];

type SettingsSection = "appearance" | "sections" | "contact" | "delivery";

export default function DashboardPersonnalisationPage() {
  const { activeStore, updateStoreSettings } = usePlatform();
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<SettingsSection>("appearance");

  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#102A43");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");
  const [template, setTemplate] = useState<StoreTemplateId>("minimal");
  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");

  // Sections de la page d'accueil
  const [showHero, setShowHero] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [showPopular, setShowPopular] = useState(true);
  const [showPromotions, setShowPromotions] = useState(true);

  // Coordonnées, paiements & réseaux
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("");
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFee, setNewZoneFee] = useState("1000");
  const [newZoneDelay, setNewZoneDelay] = useState("24h");
  const [termsOfSale, setTermsOfSale] = useState("");

  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const [mobileMoneyInstructions, setMobileMoneyInstructions] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");

  useEffect(() => {
    if (!activeStore) return;
    setStoreName(activeStore.name);
    setLogoUrl(activeStore.settings.logoUrl ?? "");
    setPrimaryColor(activeStore.settings.primaryColor);
    setSecondaryColor(activeStore.settings.secondaryColor);
    setTemplate(activeStore.settings.template);
    setBannerUrl(activeStore.settings.bannerUrl ?? "");
    setDescription(activeStore.settings.description);

    setShowHero(activeStore.settings.homeSections.showHero);
    setShowCategories(activeStore.settings.homeSections.showCategories);
    setShowPopular(activeStore.settings.homeSections.showPopular);
    setShowPromotions(activeStore.settings.homeSections.showPromotions);

    setWhatsappPhone(activeStore.settings.whatsappPhone);
    setEmail(activeStore.settings.email);
    setAddress(activeStore.settings.address);
    setDeliveryInfo(activeStore.settings.deliveryInfo);
    setDeliveryZones(activeStore.settings.deliveryZones ?? []);
    setFreeDeliveryThreshold(
      activeStore.settings.freeDeliveryThreshold
        ? String(activeStore.settings.freeDeliveryThreshold)
        : ""
    );
    setTermsOfSale(activeStore.settings.termsOfSale);

    setMobileMoneyNumber(activeStore.settings.mobileMoneyNumber ?? "");
    setMobileMoneyInstructions(
      activeStore.settings.mobileMoneyInstructions ?? ""
    );
    setInstagram(activeStore.settings.socials.instagram ?? "");
    setFacebook(activeStore.settings.socials.facebook ?? "");
    setTiktok(activeStore.settings.socials.tiktok ?? "");
  }, [activeStore]);

  if (!activeStore) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(
      activeStore.id,
      {
        logoUrl: logoUrl.trim() || undefined,
        primaryColor,
        secondaryColor,
        template,
        bannerUrl: bannerUrl.trim() || undefined,
        description,
        homeSections: {
          showHero,
          showCategories,
          showPopular,
          showPromotions,
        },
        whatsappPhone,
        email,
        address,
        deliveryInfo,
        deliveryZones,
        freeDeliveryThreshold: freeDeliveryThreshold.trim()
          ? Number(freeDeliveryThreshold)
          : null,
        termsOfSale,

        mobileMoneyNumber,
        mobileMoneyInstructions: mobileMoneyInstructions.trim() || undefined,
        socials: {
          instagram: instagram.trim() || undefined,
          facebook: facebook.trim() || undefined,
          tiktok: tiktok.trim() || undefined,
        },
      },
      storeName.trim() || activeStore.name
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DashboardPageHeader
        eyebrow="Identité personnalisée"
        title="Personnalisation"
        description="Façonnez une boutique unique à votre image : logo, couleurs, modèle, sections d'accueil et coordonnées."
        actions={
          <>
            <Link href={`/s/${activeStore.slug}`} target="_blank">
              <Button type="button" variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5" />
                Voir ma boutique
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="sm">
              {saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Enregistré !" : "Enregistrer"}
            </Button>
          </>
        }
      />

      {/* Onglets de configuration */}
      <div className="inline-flex flex-wrap gap-1.5 rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-2xs">
        {(
          [
            ["appearance", "Marque & Modèle", Palette],
            ["sections", "Sections d'accueil", LayoutTemplate],
            ["contact", "Coordonnées privées", Phone],
            ["delivery", "Livraison & Réseaux", Truck],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${section === id
              ? "bg-[#102A43] text-white"
              : "text-slate-600 hover:text-[#102A43]"
              }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {section === "appearance" && (
            <Card className="animate-tab-panel border-[#E2E8F0] bg-white">
              <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
                <h2 className="text-sm font-extrabold text-[#102A43]">
                  Logo, couleurs & style de boutique
                </h2>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <Input
                  label="Nom de la boutique"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />

                <SingleImageUploadField
                  label="Logo de la boutique"
                  hint="Format carré recommandé (PNG ou JPG). Redimensionné automatiquement."
                  value={logoUrl}
                  onChange={setLogoUrl}
                  storeId={activeStore.id}
                  folder="logos"
                  aspectClassName="h-16 w-16"
                />


                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[#102A43]">
                      Couleur principale
                    </label>
                    <div className="mt-1.5 flex items-center gap-2.5">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 w-12 cursor-pointer rounded-lg border border-[#E2E8F0]"
                      />
                      <input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 flex-1 rounded-lg border border-[#E2E8F0] px-3 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#102A43]">
                      Couleur secondaire (boutons)
                    </label>
                    <div className="mt-1.5 flex items-center gap-2.5">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-10 w-12 cursor-pointer rounded-lg border border-[#E2E8F0]"
                      />
                      <input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-10 flex-1 rounded-lg border border-[#E2E8F0] px-3 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102A43]">
                    Architecture visuelle (chaque modèle change la mise en page)
                  </label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setTemplate(tpl.id)}
                        className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${template === tpl.id
                          ? "border-[#102A43] bg-[#102A43]/[0.04] shadow-2xs"
                          : "border-[#E2E8F0] hover:bg-slate-50"
                          }`}
                      >
                        <p className="text-sm font-bold text-[#102A43]">
                          {tpl.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{tpl.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <SingleImageUploadField
                  label="Bannière principale de la boutique"
                  hint="Téléversez une photo de couverture depuis votre appareil ou collez un lien."
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  storeId={activeStore.id}
                  folder="banners"
                  aspectClassName="h-20 w-36"
                />


                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#102A43]">
                    Présentation de la boutique
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm focus:border-[#102A43] focus:outline-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {section === "sections" && (
            <Card className="animate-tab-panel border-[#E2E8F0] bg-white">
              <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
                <h2 className="text-sm font-extrabold text-[#102A43]">
                  Organisation de la page d&apos;accueil publique
                </h2>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {[
                  {
                    label: "Bannière principale (Hero)",
                    desc: "Affiche votre grande bannière d'accueil et votre message de bienvenue.",
                    checked: showHero,
                    onChange: setShowHero,
                  },
                  {
                    label: "Présentation des catégories",
                    desc: "Permet aux visiteurs d'explorer directement vos rayons.",
                    checked: showCategories,
                    onChange: setShowCategories,
                  },
                  {
                    label: "Sélection de produits populaires",
                    desc: "Met en avant les articles marqués comme populaires.",
                    checked: showPopular,
                    onChange: setShowPopular,
                  },
                  {
                    label: "Bloc Promotions",
                    desc: "Met en évidence vos offres spéciales lorsqu'un prix promo est actif.",
                    checked: showPromotions,
                    onChange: setShowPromotions,
                  },
                ].map((opt) => (
                  <label
                    key={opt.label}
                    className="flex items-start justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#102A43]">
                        {opt.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {opt.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={opt.checked}
                      onChange={(e) => opt.onChange(e.target.checked)}
                      className="mt-1 h-4.5 w-4.5 accent-[#10B981]"
                    />
                  </label>
                ))}
              </CardContent>
            </Card>
          )}

          {section === "contact" && (
            <Card className="animate-tab-panel border-[#E2E8F0] bg-white">
              <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
                <h2 className="text-sm font-extrabold text-[#15232D]">
                  Coordonnées de la boutique (Confidentialité garantie)
                </h2>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="rounded-xl border border-[#00A884]/35 bg-[#E7F7F2] p-3 text-xs text-[#073B35]">
                  <strong>Confidentialité propriétaire :</strong> votre numéro de
                  téléphone reste strictement interne à votre compte et n&apos;est
                  jamais affiché publiquement sur votre vitrine client. Toutes
                  les commandes passent par votre Formulaire COD intégré.
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Téléphone interne du propriétaire (Privé)"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                  />
                  <Input
                    label="E-mail public de contact"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Input
                  label="Adresse / Ville de référence"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </CardContent>
            </Card>
          )}

          {section === "delivery" && (
            <Card className="animate-tab-panel border-[#E2E8F0] bg-white">
              <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
                <h2 className="text-sm font-extrabold text-[#102A43]">
                  Livraison, conditions & réseaux sociaux
                </h2>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                {/* Zones & Tarifs de livraison par ville/quartier */}
                <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-[#102A43]">
                        <MapPin className="h-4 w-4 text-[#10B981]" />
                        Zones & Tarifs de livraison ({activeStore.currency})
                      </p>
                      <p className="text-xs text-slate-500">
                        Définissez un tarif exact par quartier ou ville (1 000, 1 500, 2 500, 4 000 FCFA…).
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryZones(BENIN_ZONES_PRESET)}
                        className="rounded-lg border border-[#102A43]/20 bg-white px-2.5 py-1 text-[11px] font-bold text-[#102A43] hover:border-[#10B981] cursor-pointer"
                      >
                        Modèle Bénin
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryZones(SENEGAL_ZONES_PRESET)}
                        className="rounded-lg border border-[#102A43]/20 bg-white px-2.5 py-1 text-[11px] font-bold text-[#102A43] hover:border-[#10B981] cursor-pointer"
                      >
                        Modèle Sénégal
                      </button>
                    </div>
                  </div>

                  {/* Liste des zones existantes */}
                  {deliveryZones.length > 0 && (
                    <div className="space-y-2">
                      {deliveryZones.map((zone) => (
                        <div
                          key={zone.id}
                          className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white p-2.5 text-xs"
                        >
                          <input
                            value={zone.name}
                            onChange={(e) =>
                              setDeliveryZones((prev) =>
                                prev.map((z) =>
                                  z.id === zone.id
                                    ? { ...z, name: e.target.value }
                                    : z
                                )
                              )
                            }
                            className="h-8 flex-1 min-w-[160px] rounded-md border border-[#E2E8F0] px-2.5 font-semibold text-[#102A43]"
                            placeholder="Nom de la zone"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              value={zone.fee}
                              onChange={(e) =>
                                setDeliveryZones((prev) =>
                                  prev.map((z) =>
                                    z.id === zone.id
                                      ? { ...z, fee: Number(e.target.value) || 0 }
                                      : z
                                  )
                                )
                              }
                              className="h-8 w-24 rounded-md border border-[#E2E8F0] px-2 font-bold text-[#102A43]"
                            />
                            <span className="text-[11px] font-semibold text-slate-500">
                              {activeStore.currency}
                            </span>
                          </div>
                          <input
                            value={zone.estimatedDelay ?? ""}
                            onChange={(e) =>
                              setDeliveryZones((prev) =>
                                prev.map((z) =>
                                  z.id === zone.id
                                    ? { ...z, estimatedDelay: e.target.value }
                                    : z
                                )
                              )
                            }
                            className="h-8 w-24 rounded-md border border-[#E2E8F0] px-2 text-slate-600"
                            placeholder="Délai"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDeliveryZones((prev) =>
                                prev.filter((z) => z.id !== zone.id)
                              )
                            }
                            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer"
                            title="Supprimer cette zone"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ajout rapide d'une nouvelle zone */}
                  <div className="grid gap-2 pt-1 sm:grid-cols-12">
                    <input
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      placeholder="Ex: Cotonou Centre, Calavi, Parakou..."
                      className="h-9 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs sm:col-span-5"
                    />
                    <input
                      type="number"
                      min={0}
                      value={newZoneFee}
                      onChange={(e) => setNewZoneFee(e.target.value)}
                      placeholder="Tarif (FCFA)"
                      className="h-9 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-bold sm:col-span-3"
                    />
                    <input
                      value={newZoneDelay}
                      onChange={(e) => setNewZoneDelay(e.target.value)}
                      placeholder="Délai (ex: 24h)"
                      className="h-9 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs sm:col-span-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newZoneName.trim()) return;
                        setDeliveryZones((prev) => [
                          ...prev,
                          {
                            id: `zone-${Date.now()}`,
                            name: newZoneName.trim(),
                            fee: Math.max(0, Number(newZoneFee) || 0),
                            estimatedDelay: newZoneDelay.trim() || undefined,
                          },
                        ]);
                        setNewZoneName("");
                        setNewZoneFee("1500");
                      }}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-[#102A43] px-3 text-xs font-bold text-white hover:bg-[#1B3B5A] sm:col-span-2 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter
                    </button>
                  </div>

                  {/* Seuil livraison gratuite */}
                  <div className="border-t border-[#E2E8F0] pt-3">
                    <Input
                      label={`Livraison gratuite dès un montant d'achat (${activeStore.currency} — laisser vide pour désactiver)`}
                      type="number"
                      min={0}
                      value={freeDeliveryThreshold}
                      onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                      placeholder="Ex : 35000"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#102A43]">
                    Bandeau d&apos;information livraison (haut de la boutique)
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryInfo}
                    onChange={(e) => setDeliveryInfo(e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#102A43]">
                    Conditions de vente
                  </label>
                  <textarea
                    rows={2}
                    value={termsOfSale}
                    onChange={(e) => setTermsOfSale(e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                  <Input
                    label="Facebook"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                  <Input
                    label="TikTok"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Aperçu Smartphone en direct */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <Card className="overflow-hidden border-[#E2E8F0] bg-white">
              <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3.5">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#102A43]">
                  <Smartphone className="h-4 w-4 text-[#10B981]" />
                  Aperçu mobile en direct
                </span>
                <Badge variant="navy">{template}</Badge>
              </CardHeader>
              <CardContent className="bg-[#F8FAFC] p-5">
                <div className="mx-auto max-w-xs overflow-hidden rounded-3xl border-4 border-slate-800 bg-white shadow-lg">
                  <div
                    className="px-3 py-1 text-[9px] font-medium text-white truncate"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {deliveryInfo || "Livraison rapide"}
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt=""
                          className="h-7 w-7 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {(storeName || "ES").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span className="truncate text-xs font-bold text-slate-900">
                        {storeName || activeStore.name}
                      </span>
                    </div>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Panier
                    </span>
                  </div>

                  {showHero && (
                    <div
                      className="relative overflow-hidden px-4 py-6 text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {bannerUrl && (
                        <img
                          src={bannerUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-30"
                        />
                      )}
                      <div className="relative">
                        <p className="text-sm font-extrabold text-white">
                          {storeName || activeStore.name}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-white/90">
                          {description}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 p-3.5">
                    {showCategories && (
                      <div className="flex gap-1.5">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Tous
                        </span>
                        {showPromotions && (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            Promotions
                          </span>
                        )}
                      </div>
                    )}

                    <div className="rounded-xl border border-slate-200 p-2.5">
                      <p className="text-xs font-bold text-slate-900">
                        Article exemple
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className="text-xs font-extrabold"
                          style={{ color: primaryColor }}
                        >
                          25 000 {activeStore.currency}
                        </span>
                        <span
                          className="rounded-md px-2.5 py-1 text-[10px] font-bold text-white"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          Ajouter
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}
