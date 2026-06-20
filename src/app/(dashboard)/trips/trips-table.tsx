"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { Eye, Package } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Trip, Route, Bus, Agency, User } from "@prisma/client";

type TripRow = Trip & {
  route: Route;
  bus: Bus;
  driver: Pick<User, "name"> | null;
  departureAgency: Agency;
  arrivalAgency: Agency;
  _count: { reservations: number; parcels: number };
};

export function TripsTable({ trips }: { trips: TripRow[] }) {
  const { locale } = useLocale();
  const t = getT(locale);
  const tt = t.trips;
  const ts = t.status;

  const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "teal" | "neutral" | "info" }> = {
    SCHEDULED: { label: ts.scheduled, variant: "info"        },
    BOARDING:  { label: ts.boarding,  variant: "warning"     },
    DEPARTED:  { label: ts.departed,  variant: "teal"        },
    ARRIVED:   { label: ts.arrived,   variant: "success"     },
    CANCELLED: { label: ts.cancelled, variant: "destructive" },
  };

  const columns = useMemo<ColumnDef<TripRow>[]>(() => [
    {
      accessorKey: "route",
      header: tt.route,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-sm">
            {row.original.route.originCity}
            <span className="text-muted-foreground mx-1">→</span>
            {row.original.route.destinCity}
          </p>
          <p className="text-xs text-muted-foreground">{row.original.departureAgency.city}</p>
        </div>
      ),
    },
    {
      accessorKey: "departureTime",
      header: tt.departure,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{formatDateTime(row.original.departureTime)}</p>
          {row.original.arrivalTime && (
            <p className="text-xs text-muted-foreground">{tt.arrivalAbbrev} {formatDateTime(row.original.arrivalTime)}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "bus",
      header: tt.bus,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-mono font-medium">{row.original.bus.plate}</p>
          <p className="text-xs text-muted-foreground">{row.original.bus.totalSeats} {tt.seats}</p>
        </div>
      ),
    },
    {
      accessorKey: "driver",
      header: tt.driver,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.driver?.name ?? "—"}</span>
      ),
    },
    {
      id: "occupancy",
      header: tt.occupancy,
      cell: ({ row }) => {
        const pct = Math.round((row.original._count.reservations / row.original.bus.totalSeats) * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium">{row.original._count.reservations}/{row.original.bus.totalSeats}</span>
          </div>
        );
      },
    },
    {
      id: "parcels",
      header: tt.parcels,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          {row.original._count.parcels}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t.reservations.status,
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status] ?? { label: row.original.status, variant: "neutral" as const };
        return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/trips/${row.original.id}`}>
          <Button variant="ghost" size="icon-sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [locale]);

  return (
    <DataTable
      columns={columns}
      data={trips}
      pageSize={15}
      emptyMessage={tt.empty}
    />
  );
}
