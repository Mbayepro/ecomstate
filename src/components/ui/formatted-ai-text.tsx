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
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong
              key={idx}
              className={
                darkBg ? "font-bold text-white" : "font-bold text-[#102A43]"
              }
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={idx}
              className={
                darkBg
                  ? "rounded bg-white/12 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#34D399]"
                  : "rounded bg-[#10B981]/12 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#059669]"
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
