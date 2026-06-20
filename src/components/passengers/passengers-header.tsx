"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export function PassengersHeader({ count }: { count: number }) {
  const { locale } = useLocale();
  const t = getT(locale).passengers;
  return (
    <Header
      title={t.title}
      subtitle={t.subtitle.replace("{count}", String(count))}
      actions={
        <Link href="/passengers/new">
          <Button>
            <Plus className="h-4 w-4" />
            {t.newPassenger}
          </Button>
        </Link>
      }
    />
  );
}
