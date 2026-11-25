import { ImageResponse } from "next/og";

export const alt =
  "EcomSate — Créez votre boutique en ligne en Afrique avec Adeshina IA";
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
            "linear-gradient(135deg, #071524 0%, #0B1F33 52%, #102A43 100%)",
          padding: "64px 72px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Halo décoratif Émeraude en arrière-plan */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-90px",
            width: "520px",
            height: "520px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-160px",
            left: "-80px",
            width: "460px",
            height: "460px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0) 70%)",
            display: "flex",
          }}
        />

        {/* Colonne Gauche : Logo EcomSate + Proposition de valeur */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "660px",
            zIndex: 10,
          }}
        >
          {/* Logo officiel EcomSate */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            <svg
              width="74"
              height="65"
              viewBox="0 0 64 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 17.5C24 8.2 39.5 8.2 39.5 18.5"
                stroke="#3B82F6"
                strokeWidth="4.2"
                strokeLinecap="round"
              />
              <path
                d="M13.8 17.2C14.3 15.1 16.2 14.4 18.2 14.8L22.2 15.5L16.8 45.8L11.8 44.8C9.8 44.4 9.1 42.5 9.6 40.5L13.8 17.2Z"
                fill="#10B981"
              />
              <path
                d="M20.5 15.3L45.8 18C47.9 18.2 49.4 19.9 49.6 22L51.2 43.8C51.4 46.1 49.5 48 47.2 47.9L16.6 46L20.5 15.3Z"
                fill="#133454"
                stroke="#2C5982"
                strokeWidth="1.2"
              />
              <path
                d="M28.2 23.2V20.2M24.6 26.8H21.6M25.6 24.2L23.5 22.1"
                stroke="#FFFFFF"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
              <path
                d="M28.2 26.6L40.4 31.6L35.4 33.7L38.4 38.8L35.6 40.4L32.6 35.3L29.6 39L28.2 26.6Z"
                fill="#FFFFFF"
              />
              <path
                d="M44.2 14.2C56.8 14.2 61.5 23.2 53.6 34.4C44.8 46.8 24.4 52.2 4.8 52.6C21.2 49.6 39.2 42.8 47.8 32.2C54.2 24.2 52.2 16.4 44.2 14.2Z"
                fill="#10B981"
              />
            </svg>

            <div
              style={{
                width: "2px",
                height: "44px",
                backgroundColor: "rgba(255,255,255,0.18)",
                display: "flex",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "42px",
                  fontWeight: 800,
                  letterSpacing: "-1px",
                  color: "#FFFFFF",
                  lineHeight: 1,
                }}
              >
                <span>Ecom</span>
                <span style={{ color: "#10B981" }}>Sate</span>
              </div>
              <span
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  color: "#94A3B8",
                  fontWeight: 500,
                }}
              >
                Votre boutique. Votre marque. Votre commerce.
              </span>
            </div>
          </div>

          {/* Badge Adeshina IA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              alignSelf: "flex-start",
              backgroundColor: "rgba(16, 185, 129, 0.14)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: "9999px",
              padding: "8px 18px",
              marginBottom: "22px",
            }}
          >
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "9999px",
                backgroundColor: "#10B981",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#34D399",
              }}
            >
              Propulsé par Adeshina IA · 0 % commission sur vos ventes
            </span>
          </div>

          {/* Titre principal */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "52px",
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-1.2px",
              color: "#FFFFFF",
              marginBottom: "22px",
            }}
          >
            <span>Créez votre boutique</span>
            <span>
              en ligne{" "}
              <span style={{ color: "#10B981" }}>en 2 minutes.</span>
            </span>
          </div>

          <span
            style={{
              fontSize: "20px",
              lineHeight: 1.45,
              color: "#CBD5E1",
              marginBottom: "30px",
            }}
          >
            Catalogue pro, gestion des stocks, commandes WhatsApp et Mobile
            Money pour les commerçants africains.
          </span>

          {/* Pays couverts */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#E2E8F0",
            }}
          >
            {["Bénin", "Sénégal", "Côte d'Ivoire", "Togo", "Burkina Faso"].map(
              (country) => (
                <span
                  key={country}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                  }}
                >
                  {country}
                </span>
              )
            )}
          </div>
        </div>

        {/* Colonne Droite : Aperçu carte SaaS Premium */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "350px",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: "28px",
            padding: "28px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.45)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Essai Complet 30 Jours
            </span>
            <span
              style={{
                backgroundColor: "#10B981",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: "9999px",
              }}
            >
              Actif
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontSize: "44px",
                fontWeight: 800,
                color: "#FFFFFF",
              }}
            >
              2 000 FCFA
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: "20px",
            }}
          >
            {[
              "Sous-domaine .ecomsate.com inclus",
              "Commandes WhatsApp & Livraison",
              "Paiements Mobile Money directs",
              "Tableau de bord & Stocks temps réel",
              "Copilote commercial Adeshina IA",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "15px",
                  color: "#F1F5F9",
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(16,185,129,0.22)",
                    color: "#34D399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
