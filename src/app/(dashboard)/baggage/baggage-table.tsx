"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Baggage, Reservation, Passenger, Trip, Route } from "@prisma/client";

type BaggageRow = Baggage & {
  reservation: Reservation & {
    passenger: Passenger;
    trip: Trip & { route: Route };
  };
};

export function BaggageTable({ baggages }: { baggages: BaggageRow[] }) {
  const { locale } = useLocale();
  const t = getT(locale);
  const tb = t.baggage;
  const ts = t.status;

  const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "info" }> = {
    REGISTERED: { label: ts.registered, variant: "info"    },
    LOADED:     { label: ts.loaded,     variant: "warning" },
    DELIVERED:  { label: ts.delivered,  variant: "success" },
  };

  const columns = useMemo<ColumnDef<BaggageRow>[]>(() => [
    {
      accessorKey: "reservation.passenger.fullName",
      header: tb.passenger,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.reservation.passenger.fullName}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">{row.original.reservation.passenger.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "reservation.trip",
      header: tb.trip,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.reservation.trip.route.originCity} → {row.original.reservation.trip.route.destinCity}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: tb.qty,
      cell: ({ row }) => <span className="font-semibold text-sm">{row.original.quantity}</span>,
    },
    {
      accessorKey: "weightKg",
      header: tb.weight,
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.weightKg} kg</span>,
    },
    {
      accessorKey: "surchargePrice",
      header: tb.surcharge,
      cell: ({ row }) => (
        <span className={`text-sm font-medium ${row.original.surchargePrice > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
          {row.original.surchargePrice > 0 ? formatCurrency(row.original.surchargePrice) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: tb.status,
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status] ?? { label: row.original.status, variant: "info" as const };
        return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: tb.date,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [locale]);

  return (
    <DataTable
      columns={columns}
      data={baggages}
      pageSize={15}
      emptyMessage={tb.empty}
    />
  );
}
