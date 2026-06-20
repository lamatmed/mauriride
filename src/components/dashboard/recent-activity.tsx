"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatCurrency, getInitials } from "@/lib/utils";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export interface RecentReservation {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  passenger: { fullName: string };
  trip: {
    route: { originCity: string; destinCity: string };
  };
}

export function RecentActivity({ reservations }: { reservations: RecentReservation[] }) {
  const { locale } = useLocale();
  const t  = getT(locale);
  const td = t.dashboard;
  const ts = t.status;

  const STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "teal" | "neutral" }> = {
    CONFIRMED: { label: ts.confirmed, variant: "success"     },
    PENDING:   { label: ts.pending,   variant: "warning"     },
    CANCELLED: { label: ts.cancelled, variant: "destructive" },
    BOARDED:   { label: ts.boarded,   variant: "teal"        },
    NO_SHOW:   { label: ts.absent,    variant: "neutral"     },
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{td.recentActivity}</CardTitle>
        <Link href="/reservations" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
          {td.seeAll}
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {td.noReservations}
          </p>
        ) : (
          reservations.map((r) => {
            const status = STATUS_MAP[r.status] ?? { label: r.status, variant: "neutral" as const };
            return (
              <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getInitials(r.passenger.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.passenger.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.trip.route.originCity} → {r.trip.route.destinCity}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant={status.variant} dot>{status.label}</Badge>
                  <span className="text-xs font-semibold text-primary">{formatCurrency(r.totalPrice)}</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
