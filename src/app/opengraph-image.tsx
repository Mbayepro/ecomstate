import { ImageResponse } from "next/og";

export const alt =
  "EcomSate — Votre e-commerce. Un seul espace. Une intelligence qui travaille avec vous.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #052B27 0%, #073B35 55%, #0B5249 100%)",
          padding: "64px 72px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "680px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "44px",
                  fontWeight: 800,
                  letterSpacing: "-1px",
                  color: "#FFFFFF",
                  lineHeight: 1,
                }}
              >
                <span>Ecom</span>
                <span style={{ color: "#00A884" }}>Sate</span>
              </div>
              <span
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  color: "#E7F7F2",
                  fontWeight: 500,
                }}
              >
                Plateforme SaaS E-commerce COD & Adeshina IA
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "48px",
              fontWeight: 800,
              lineHeight: 1.14,
              letterSpacing: "-1.1px",
              color: "#FFFFFF",
              marginBottom: "22px",
            }}
          >
            <span>Votre e-commerce.</span>
            <span>Un seul espace.</span>
            <span style={{ color: "#00A884" }}>Propulsé par Adeshina IA.</span>
          </div>

          <span
            style={{
              fontSize: "20px",
              lineHeight: 1.45,
              color: "#E7F7F2",
            }}
          >
            Store Builder Shrine Pro, Form Builder COD, suivi des livreurs et
            calcul du bénéfice net réel.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "340px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            borderRadius: "28px",
            padding: "28px",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#E7F7F2",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "14px",
            }}
          >
            Offres Standard & Premium
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              borderTop: "1px solid rgba(255,255,255,0.14)",
              paddingTop: "18px",
            }}
          >
            {[
              "Store Builder & Thèmes Shrine Pro",
              "Form Builder 100 % COD",
              "Suivi Livreurs & Reversements",
              "Dépenses & Bénéfice Net Réel",
              "Copilote opérationnel Adeshina IA",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "15px",
                  color: "#FFFFFF",
                  fontWeight: 500,
                }}
              >
                <span style={{ color: "#00A884", fontWeight: 800 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
