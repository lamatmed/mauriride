"use client";

import { Header } from "@/components/layout/header";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

interface Props {
  userName: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ userName, actions }: Props) {
  const { locale } = useLocale();
  const t = getT(locale).dashboard;

  const firstName = userName.split(" ")[0];
  const subtitle  = t.subtitle.replace("{name}", firstName);

  return <Header title={t.title} subtitle={subtitle} actions={actions} />;
}
