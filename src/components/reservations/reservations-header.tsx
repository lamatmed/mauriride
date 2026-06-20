"use client";

import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

interface Props {
  total: number;
  confirmed: number;
  boarded: number;
  cancelled: number;
}

export function ReservationsHeader({ total, confirmed, boarded, cancelled }: Props) {
  const { locale } = useLocale();
  const t = getT(locale).reservations;

  const subtitle = t.subtitle.replace("{count}", String(total));

  return (
    <>
      <Header
        title={t.title}
        subtitle={subtitle}
        actions={
          <Link href="/reservations/new">
            <Button>
              <Plus className="h-4 w-4" />
              {t.newReservation}
            </Button>
          </Link>
        }
      />
      <div className="flex items-center gap-3 flex-wrap px-6 pt-4">
        <Badge variant="neutral"     className="px-3 py-1.5 text-sm">{t.total}: {total}</Badge>
        <Badge variant="success"     className="px-3 py-1.5 text-sm">{t.confirmed}: {confirmed}</Badge>
        <Badge variant="teal"        className="px-3 py-1.5 text-sm">{t.boarded}: {boarded}</Badge>
        <Badge variant="destructive" className="px-3 py-1.5 text-sm">{t.cancelled}: {cancelled}</Badge>
      </div>
    </>
  );
}
