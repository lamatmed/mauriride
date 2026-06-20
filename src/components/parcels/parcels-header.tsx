"use client";

import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

interface ParcelsStats {
  total: number;
  received: number;
  inTransit: number;
  delivered: number;
}

export function ParcelsHeader({ stats }: { stats: ParcelsStats }) {
  const { locale } = useLocale();
  const t  = getT(locale).parcels;
  const ts = getT(locale).status;
  return (
    <>
      <Header
        title={t.title}
        subtitle={t.subtitle.replace("{count}", String(stats.total)).replace("{inTransit}", String(stats.inTransit))}
        actions={
          <Link href="/parcels/new">
            <Button>
              <Plus className="h-4 w-4" />
              {t.newParcel}
            </Button>
          </Link>
        }
      />
      <div className="px-6 pb-4 flex items-center gap-3 flex-wrap">
        <Badge variant="neutral"  className="px-3 py-1.5 text-sm">{t.total}: {stats.total}</Badge>
        <Badge variant="info"     className="px-3 py-1.5 text-sm">{ts.received}: {stats.received}</Badge>
        <Badge variant="warning"  className="px-3 py-1.5 text-sm">{ts.inTransit}: {stats.inTransit}</Badge>
        <Badge variant="success"  className="px-3 py-1.5 text-sm">{ts.delivered}: {stats.delivered}</Badge>
      </div>
    </>
  );
}
