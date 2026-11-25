import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Icône vectorielle officielle EcomSate :
 * Sac shopping 3D (tranche émeraude + face bleu nuit) + curseur clic blanc + orbite émeraude dynamique.
 */
export function BrandLogoMark({
  light = false,
  className = "h-10 w-11",
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
    >
      {/* Anse supérieure du sac */}
      <path
        d="M24 17.5C24 8.2 39.5 8.2 39.5 18.5"
        stroke={light ? "#3B82F6" : "#102A43"}
        strokeOpacity={light ? "0.85" : "1"}
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* Tranche 3D gauche du sac (Vert Émeraude) */}
      <path
        d="M13.8 17.2C14.3 15.1 16.2 14.4 18.2 14.8L22.2 15.5L16.8 45.8L11.8 44.8C9.8 44.4 9.1 42.5 9.6 40.5L13.8 17.2Z"
        fill="#10B981"
      />

      {/* Face principale du sac (Bleu Nuit avec contour subtil sur fond sombre) */}
      <path
        d="M20.5 15.3L45.8 18C47.9 18.2 49.4 19.9 49.6 22L51.2 43.8C51.4 46.1 49.5 48 47.2 47.9L16.6 46L20.5 15.3Z"
        fill={light ? "#133454" : "#0F2942"}
        stroke={light ? "#2C5982" : "none"}
        strokeWidth={light ? "1.1" : "0"}
      />

      {/* Rayons du clic autour de la pointe du curseur */}
      <path
        d="M28.2 23.2V20.2M24.6 26.8H21.6M25.6 24.2L23.5 22.1"
        stroke="#FFFFFF"
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      {/* Curseur de souris blanc (e-commerce en 1 clic) */}
      <path
        d="M28.2 26.6L40.4 31.6L35.4 33.7L38.4 38.8L35.6 40.4L32.6 35.3L29.6 39L28.2 26.6Z"
        fill="#FFFFFF"
      />

      {/* Orbite dynamique Vert Émeraude enveloppant le sac */}
      <path
        d="M44.2 14.2C56.8 14.2 61.5 23.2 53.6 34.4C44.8 46.8 24.4 52.2 4.8 52.6C21.2 49.6 39.2 42.8 47.8 32.2C54.2 24.2 52.2 16.4 44.2 14.2Z"
        fill="#10B981"
      />
      <path
        d="M44.2 14.2C53.2 15.6 56.2 22.4 50.2 31.2C44.8 39.1 31.5 46.2 15.5 50.4C29.8 46.2 42.8 39.2 47.8 32.2C54.2 24.2 52.2 16.4 44.2 14.2Z"
        fill="#34D399"
        fillOpacity="0.45"
      />
    </svg>
  );
}

export function BrandLogo({
  href = "/",
  light = false,
  showTagline = false,
  className,
}: {
  href?: string;
  light?: boolean;
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <BrandLogoMark
        light={light}
        className={cn(
          "transition-transform duration-200 group-hover:scale-105",
          showTagline ? "h-12 w-13" : "h-10 w-11"
        )}
      />

      <span
        className={cn(
          "h-7 w-px shrink-0",
          light ? "bg-white/15" : "bg-[#102A43]/15"
        )}
        aria-hidden="true"
      />

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.35rem] font-extrabold tracking-tight",
            light ? "text-white" : "text-[#102A43]"
          )}
        >
          Ecom<span className="text-[#10B981]">Sate</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 text-[10px] font-medium tracking-wide",
              light ? "text-slate-300" : "text-slate-500"
            )}
          >
            Votre boutique. Votre marque. Votre commerce.
          </span>
        )}
      </span>
    </Link>
  );
}
