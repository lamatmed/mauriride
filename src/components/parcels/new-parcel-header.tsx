"use client";

import { Header } from "@/components/layout/header";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function NewParcelHeader() {
  const { locale } = useLocale();
  const t = getT(locale).parcels;
  return <Header title={t.newParcel} subtitle={t.newSubtitle} />;
}
