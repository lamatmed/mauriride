"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Bus, Users } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export interface ActiveTrip {
  id: string;
  status: string;
  departureTime: string;
  route: { originCity: string; destinCity: string };
  bus: { plate: string; totalSeats: number };
  reservationCount: number;
}

export function ActiveTrips({ trips }: { trips: ActiveTrip[] }) {
  const { locale } = useLocale();
  const t  = getT(locale);
  const td = t.dashboard;
  const ts = t.status;

  const STATUS_CONFIG: Record<string, { label: string; variant: "info" | "warning" | "teal" | "success" | "destructive" }> = {
    SCHEDULED: { label: ts.scheduled, variant: "info"        },
    BOARDING:  { label: ts.boarding,  variant: "warning"     },
    DEPARTED:  { label: ts.departed,  variant: "teal"        },
    ARRIVED:   { label: ts.arrived,   variant: "success"     },
    CANCELLED: { label: ts.cancelled, variant: "destructive" },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{td.activeTrips}</CardTitle>
        <Link href="/trips" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
          {td.seeAllTrips}
        </Link>
      </CardHeader>
      <CardContent>
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bus className="h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm">{td.noActiveTrips}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => {
              const status    = STATUS_CONFIG[trip.status] ?? { label: trip.status, variant: "neutral" as const };
              const occupancy = Math.round((trip.reservationCount / trip.bus.totalSeats) * 100);
              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-border hover:border-teal-300 hover:bg-muted/50 transition-all group"
                >
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-50 transition-colors">
                    <Bus className="h-5 w-5 text-primary group-hover:text-teal-600 transition-colors" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-primary">
                        {trip.route.originCity}
                        <span className="text-muted-foreground font-normal mx-1">→</span>
                        {trip.route.destinCity}
                      </p>
                      <Badge variant={status.variant} dot>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {td.departureLabel}: {formatDateTime(trip.departureTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {td.busLabel}: {trip.bus.plate}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span className="font-semibold text-foreground">{trip.reservationCount}</span>
                      <span>/ {trip.bus.totalSeats}</span>
                    </div>
                    <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{occupancy}%</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
