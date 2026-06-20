"use client";

import { Header } from "@/components/layout/header";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function NewAgencyHeader() {
  const { locale } = useLocale();
  const t = getT(locale).agencies;
  return <Header title={t.newAgency} subtitle={t.newSubtitle} />;
}
