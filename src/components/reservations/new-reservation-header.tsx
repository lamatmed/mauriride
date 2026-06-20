"use client";

import { Header } from "@/components/layout/header";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function NewReservationHeader() {
  const { locale } = useLocale();
  const t = getT(locale).reservations;
  return <Header title={t.newReservation} subtitle={t.newSubtitle} />;
}
