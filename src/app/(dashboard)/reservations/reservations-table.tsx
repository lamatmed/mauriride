"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { Eye, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Reservation, Passenger, Trip, Route, Agency, Bus, Payment, User } from "@prisma/client";

type ReservationRow = Reservation & {
  passenger: Passenger;
  trip: Trip & { route: Route; departureAgency: Agency; bus: Bus };
  agent: Pick<User, "name">;
  payment: Payment | null;
};

export function ReservationsTable({ reservations }: { reservations: ReservationRow[] }) {
  const { locale } = useLocale();
  const t  = getT(locale);
  const tr = t.reservations;
  const ts = t.status;

  const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "teal" | "neutral" }> = {
    CONFIRMED: { label: ts.confirmed, variant: "success"     },
    PENDING:   { label: ts.pending,   variant: "warning"     },
    CANCELLED: { label: ts.cancelled, variant: "destructive" },
    BOARDED:   { label: ts.boarded,   variant: "teal"        },
    NO_SHOW:   { label: ts.absent,    variant: "neutral"     },
  };

  const columns = useMemo<ColumnDef<ReservationRow>[]>(() => [
    {
      accessorKey: "ticketNumber",
      header: tr.ticketNo,
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
          {row.original.ticketNumber.substring(0, 12)}...
        </span>
      ),
    },
    {
      accessorKey: "passenger.fullName",
      header: ({ column }) => (
        <Button
          variant="ghost" size="sm"
          className="h-auto p-0 hover:bg-transparent font-semibold text-xs uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting()}
        >
          {tr.passenger} <ArrowUpDown className="ml-1.5 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.passenger.fullName}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">{row.original.passenger.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "trip.route",
      header: tr.trip,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">
            {row.original.trip.route.originCity} → {row.original.trip.route.destinCity}
          </p>
          <p className="text-xs text-muted-foreground">{row.original.trip.bus.plate}</p>
        </div>
      ),
    },
    {
      accessorKey: "trip.departureTime",
      header: tr.departure,
      cell: ({ row }) => (
        <span className="text-sm">{formatDateTime(row.original.trip.departureTime)}</span>
      ),
    },
    {
      accessorKey: "seatNumber",
      header: tr.seat,
      cell: ({ row }) => (
        <span className="font-semibold text-sm bg-primary/5 px-2 py-1 rounded">
          {row.original.seatNumber}
        </span>
      ),
    },
    {
      accessorKey: "totalPrice",
      header: tr.price,
      cell: ({ row }) => (
        <span className="font-semibold text-sm text-teal-600">
          {formatCurrency(row.original.totalPrice)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: tr.status,
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status] ?? { label: row.original.status, variant: "neutral" as const };
        return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: tr.createdAt,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/reservations/${row.original.id}`}>
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
      data={reservations}
      searchKey="passenger_fullName"
      searchPlaceholder={tr.search}
      pageSize={15}
    />
  );
}
