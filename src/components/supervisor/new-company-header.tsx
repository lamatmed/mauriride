"use client";

import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function NewCompanyHeader() {
  const { locale } = useLocale();
  const t = getT(locale).supervisor.companyForm;
  const isAr = locale === "ar";

  return (
    <div className="mb-8" dir={isAr ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
      <p className="text-muted-foreground mt-1">{t.subtitle}</p>
    </div>
  );
}
