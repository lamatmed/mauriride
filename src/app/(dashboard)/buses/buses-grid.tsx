"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Users, Calendar, Wrench, Eye } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Bus as BusType } from "@prisma/client";

type BusRow = BusType & { _count: { trips: number } };

export function BusesGrid({ buses }: { buses: BusRow[] }) {
  const { locale } = useLocale();
  const t = getT(locale).buses;

  const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "neutral" }> = {
    ACTIVE:      { label: t.status.active,      variant: "success"     },
    MAINTENANCE: { label: t.status.maintenance, variant: "warning"     },
    RETIRED:     { label: t.status.retired,     variant: "destructive" },
  };

  if (buses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Bus className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">{t.empty}</p>
        <Link href="/buses/new">
          <Button className="mt-4">{t.emptyHint}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {buses.map((bus) => {
        const status = STATUS_CONFIG[bus.status] ?? { label: bus.status, variant: "neutral" as const };
        return (
          <Card key={bus.id} className="group hover:border-teal-300 transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                  <Bus className="h-6 w-6 text-primary group-hover:text-teal-600 transition-colors" />
                </div>
                <Badge variant={status.variant} dot>{status.label}</Badge>
              </div>

              <p className="text-xl font-bold font-mono text-primary tracking-wider">{bus.plate}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {bus.brand} {bus.model} {bus.year ? `(${bus.year})` : ""}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-muted rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                    <Users className="h-3 w-3" />
                    {t.seats}
                  </div>
                  <p className="text-sm font-bold text-primary">{bus.totalSeats}</p>
                </div>
                <div className="bg-muted rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                    <Calendar className="h-3 w-3" />
                    {t.trips}
                  </div>
                  <p className="text-sm font-bold text-primary">{bus._count.trips}</p>
                </div>
              </div>

              {bus.lastMaintenance && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wrench className="h-3 w-3" />
                  {t.lastMaint.replace("{date}", formatDate(bus.lastMaintenance))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Link href={`/buses/${bus.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-3.5 w-3.5" />
                    {t.details}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
