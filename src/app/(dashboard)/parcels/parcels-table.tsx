"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Parcel, Agency, Trip, Route, Payment } from "@prisma/client";

type ParcelRow = Parcel & {
  senderAgency: Agency;
  receiverAgency: Agency;
  trip: (Trip & { route: Route }) | null;
  payment: Payment | null;
};

export function ParcelsTable({ parcels }: { parcels: ParcelRow[] }) {
  const { locale } = useLocale();
  const t = getT(locale);
  const tp = t.parcels;
  const ts = t.status;

  const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "teal" | "neutral" | "info" }> = {
    RECEIVED:   { label: ts.received,   variant: "info"        },
    IN_TRANSIT: { label: ts.inTransit,  variant: "warning"     },
    ARRIVED:    { label: ts.arrived,    variant: "teal"        },
    DELIVERED:  { label: ts.delivered,  variant: "success"     },
    RETURNED:   { label: ts.returned,   variant: "destructive" },
  };

  const columns = useMemo<ColumnDef<ParcelRow>[]>(() => [
    {
      accessorKey: "trackingNumber",
      header: tp.trackingNo,
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
          {row.original.trackingNumber.substring(0, 16)}
        </span>
      ),
    },
    {
      accessorKey: "senderName",
      header: tp.sender,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.senderName}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">{row.original.senderPhone}</p>
        </div>
      ),
    },
    {
      accessorKey: "receiverName",
      header: tp.recipient,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.receiverName}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">{row.original.receiverPhone}</p>
        </div>
      ),
    },
    {
      accessorKey: "senderAgency",
      header: tp.trip,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.senderAgency.city} → {row.original.receiverAgency.city}</p>
          {row.original.trip && (
            <p className="text-xs text-muted-foreground">{formatDateTime(row.original.trip.departureTime ?? row.original.createdAt)}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "weightKg",
      header: tp.weight,
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.weightKg} kg</span>
      ),
    },
    {
      accessorKey: "price",
      header: tp.price,
      cell: ({ row }) => (
        <span className="font-semibold text-sm text-teal-600">{formatCurrency(row.original.price)}</span>
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
      accessorKey: "createdAt",
      header: tp.date,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/parcels/${row.original.id}`}>
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
      data={parcels}
      searchKey="senderName"
      searchPlaceholder={tp.search}
      pageSize={15}
    />
  );
}
