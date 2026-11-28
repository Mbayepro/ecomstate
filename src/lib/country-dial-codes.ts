export interface CountryDialMeta {
  code: string;
  name: string;
  dialCode: string;
  currency: string;
  placeholder: string;
}

/**
 * Référentiel des pays & indicatifs téléphoniques (Afrique francophone, Maghreb & Diaspora)
 */
export const COUNTRY_DIAL_LIST: CountryDialMeta[] = [
  { code: "BJ", name: "Bénin", dialCode: "+229", currency: "FCFA", placeholder: "01 97 00 00 00" },
  { code: "SN", name: "Sénégal", dialCode: "+221", currency: "FCFA", placeholder: "77 123 45 67" },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225", currency: "FCFA", placeholder: "07 00 00 00 00" },
  { code: "TG", name: "Togo", dialCode: "+228", currency: "FCFA", placeholder: "90 00 00 00" },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", currency: "FCFA", placeholder: "70 00 00 00" },
  { code: "ML", name: "Mali", dialCode: "+223", currency: "FCFA", placeholder: "76 00 00 00" },
  { code: "NE", name: "Niger", dialCode: "+227", currency: "FCFA", placeholder: "96 00 00 00" },
  { code: "GN", name: "Guinée", dialCode: "+224", currency: "GNF", placeholder: "622 00 00 00" },
  { code: "CM", name: "Cameroun", dialCode: "+237", currency: "FCFA", placeholder: "6 90 00 00 00" },
  { code: "GA", name: "Gabon", dialCode: "+241", currency: "FCFA", placeholder: "074 00 00 00" },
  { code: "CG", name: "Congo", dialCode: "+242", currency: "FCFA", placeholder: "06 600 00 00" },
  { code: "CD", name: "RD Congo", dialCode: "+243", currency: "USD", placeholder: "81 000 00 00" },
  { code: "TD", name: "Tchad", dialCode: "+235", currency: "FCFA", placeholder: "66 00 00 00" },
  { code: "MR", name: "Mauritanie", dialCode: "+222", currency: "MRU", placeholder: "46 00 00 00" },
  { code: "MA", name: "Maroc", dialCode: "+212", currency: "MAD", placeholder: "6 12 34 56 78" },
  { code: "DZ", name: "Algérie", dialCode: "+213", currency: "DZD", placeholder: "5 50 00 00 00" },
  { code: "TN", name: "Tunisie", dialCode: "+216", currency: "TND", placeholder: "20 123 456" },
  { code: "FR", name: "France", dialCode: "+33", currency: "EUR", placeholder: "6 12 34 56 78" },
];

export function getCountryDialMeta(countryCode?: string): CountryDialMeta {
  const upper = (countryCode ?? "BJ").toUpperCase();
  return (
    COUNTRY_DIAL_LIST.find((c) => c.code === upper) ?? COUNTRY_DIAL_LIST[0]
  );
}

/**
 * Assemble proprement l'indicatif choisi (`+229`, `+221`...) et le numéro saisi
 * sans jamais dupliquer l'indicatif si l'utilisateur l'a déjà tapé.
 */
export function formatPhoneWithDialCode(
  dialCode: string,
  rawPhone: string
): string {
  const trimmed = rawPhone.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  const cleanDialDigits = dialCode.replace(/[^\d]/g, "");
  const onlyDigits = trimmed.replace(/\s+/g, "");
  if (onlyDigits.startsWith(`00${cleanDialDigits}`)) {
    return `${dialCode} ${onlyDigits.slice(2 + cleanDialDigits.length)}`.trim();
  }
  return `${dialCode} ${trimmed}`.trim();
}
