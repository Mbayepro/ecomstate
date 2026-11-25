import React from "react";

/**
 * Convertit proprement le texte léger de l'IA (**gras** et `code`) en éléments React stylés,
 * afin qu'aucune étoile `**` ou accent grave `` ` `` brut ne s'affiche à l'écran.
 */
export function FormattedAiText({
  text,
  darkBg = false,
}: {
  text: string;
  darkBg?: boolean;
}) {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong
              key={idx}
              className={
                darkBg ? "font-bold text-white" : "font-bold text-[#15232D]"
              }
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <span
              key={idx}
              className={
                darkBg
                  ? "font-semibold text-[#E7F7F2]"
                  : "font-semibold text-[#073B35]"
              }
            >
              {part.slice(1, -1)}
            </span>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={idx}
              className={
                darkBg
                  ? "rounded bg-white/12 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#E7F7F2]"
                  : "rounded bg-[#E7F7F2] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#073B35]"
              }
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
}
