import { create } from "zustand";
import { persist } from "zustand/middleware";

type Locale = "fr" | "ar";

interface LocaleStore {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
}

export const useLocale = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: "fr",
      setLocale: (locale) => set({ locale }),
      toggle: () => set((s) => ({ locale: s.locale === "fr" ? "ar" : "fr" })),
    }),
    { name: "locale" }
  )
);
