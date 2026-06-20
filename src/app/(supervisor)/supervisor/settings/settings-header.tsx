"use client";

import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function SupervisorSettingsHeader() {
  const { locale } = useLocale();
  const t = getT(locale);
  const isAr = locale === "ar";

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4" dir={isAr ? "rtl" : "ltr"}>
      <h1 className="text-xl font-bold text-primary">{t.settings.title}</h1>
      <p className="text-xs text-muted-foreground mt-0.5">{t.settings.subtitle}</p>
    </div>
  );
}
