"use client";

import { Header } from "@/components/layout/header";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function NewUserHeader() {
  const { locale } = useLocale();
  const t = getT(locale).users;
  return <Header title={t.newUser} subtitle={t.newSubtitle} />;
}
