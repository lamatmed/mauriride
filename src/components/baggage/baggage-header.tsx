"use client";

import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

interface BaggageStats {
  total: number;
  registered: number;
  loaded: number;
  delivered: number;
  totalWeight: number;
}

export function BaggageHeader({ stats }: { stats: BaggageStats }) {
  const { locale } = useLocale();
  const t  = getT(locale).baggage;
  const ts = getT(locale).status;
  return (
    <>
      <Header
        title={t.title}
        subtitle={t.subtitle.replace("{count}", String(stats.total)).replace("{weight}", stats.totalWeight.toFixed(1))}
      />
      <div className="px-6 pb-4 flex items-center gap-3 flex-wrap">
        <Badge variant="neutral" className="px-3 py-1.5 text-sm">{t.total}: {stats.total}</Badge>
        <Badge variant="info"    className="px-3 py-1.5 text-sm">{t.registered}: {stats.registered}</Badge>
        <Badge variant="warning" className="px-3 py-1.5 text-sm">{t.loaded}: {stats.loaded}</Badge>
        <Badge variant="success" className="px-3 py-1.5 text-sm">{ts.delivered}: {stats.delivered}</Badge>
      </div>
    </>
  );
}
