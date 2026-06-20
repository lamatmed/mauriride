"use client";

import { Header } from "@/components/layout/header";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function FinanceHeader() {
  const { locale } = useLocale();
  const t = getT(locale).finance;
  return <Header title={t.title} subtitle={t.subtitle} />;
}
