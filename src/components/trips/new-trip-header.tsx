"use client";

import { Header } from "@/components/layout/header";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function NewTripHeader() {
  const { locale } = useLocale();
  const t = getT(locale).trips;
  return <Header title={t.newTrip} subtitle={t.newSubtitle} />;
}
