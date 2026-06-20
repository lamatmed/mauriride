"use client";

import { Header } from "@/components/layout/header";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function BoardingHeader() {
  const { locale } = useLocale();
  const t = getT(locale).boarding;
  return <Header title={t.title} subtitle={t.subtitle} />;
}
