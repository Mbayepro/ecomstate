import { ImageResponse } from "next/og";
import { INITIAL_STORES } from "@/lib/seed-data";

export const alt = "Boutique officielle sur EcomSate";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function StoreOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = INITIAL_STORES.find((s) => s.slug === slug);

  const storeName = store?.name ?? slug.replace(/-/g, " ").toUpperCase();
  const storeDesc =
    store?.settings.description ??
    "Découvrez notre catalogue en ligne et commandez en 30 secondes — Paiement 100 % à la livraison.";
  const primary = store?.settings.primaryColor ?? "#073B35";
  const secondary = store?.settings.secondaryColor ?? "#00A884";
  const domain = store?.customDomain || store?.subdomain || `${slug}.ecomsate.com`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, #052B27 0%, ${primary} 100%)`,
          padding: "64px 72px",
          fontFamily: "sans-serif",
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "9999px",
              padding: "8px 18px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#F8FAFC",
            }}
          >
            {domain}
          </span>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            Propulsé par Ecom
            <span style={{ color: "#00A884" }}>Sate</span>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: "900px" }}>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            {storeName}
          </span>
          <span
            style={{
              fontSize: "24px",
              lineHeight: 1.45,
              color: "#E2E8F0",
            }}
          >
            {storeDesc.slice(0, 150)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.16)",
            paddingTop: "24px",
          }}
        >
          <span style={{ fontSize: "18px", color: "#E7F7F2" }}>
            Commande directe en ligne · Livraison rapide · 100 % Paiement à la livraison (COD)
          </span>
          <span
            style={{
              backgroundColor: secondary,
              color: "#FFFFFF",
              padding: "12px 26px",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: 800,
            }}
          >
            Voir le catalogue →
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
