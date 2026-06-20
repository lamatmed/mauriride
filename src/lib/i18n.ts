import fr from "./i18n/fr.json";
import ar from "./i18n/ar.json";

export const translations = { fr, ar } as const;

export type Translations = typeof fr;
export type Locale = "fr" | "ar";

export function getT(locale: Locale): Translations {
  return translations[locale] as unknown as Translations;
}
