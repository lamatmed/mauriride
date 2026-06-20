"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { formatDate, getInitials } from "@/lib/utils";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Passenger } from "@prisma/client";

type PassengerRow = Passenger & { _count: { reservations: number } };

export function PassengersTable({ passengers }: { passengers: PassengerRow[] }) {
  const { locale } = useLocale();
  const t = getT(locale).passengers;

  const columns = useMemo<ColumnDef<PassengerRow>[]>(() => [
    {
      accessorKey: "fullName",
      header: t.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(row.original.fullName)}
          </div>
          <div>
            <p className="font-medium text-sm">{row.original.fullName}</p>
            {row.original.email && (
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: t.phone,
      cell: ({ row }) => <span className="text-sm font-mono" dir="ltr">{row.original.phone}</span>,
    },
    {
      accessorKey: "idNumber",
      header: t.idNumber,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.idNumber ?? "—"}</span>
      ),
    },
    {
      accessorKey: "_count.reservations",
      header: t.trips,
      cell: ({ row }) => (
        <span className="font-semibold text-sm">{row.original._count.reservations}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t.createdAt,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/passengers/${row.original.id}`}>
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
      data={passengers}
      searchKey="fullName"
      searchPlaceholder={t.search}
      pageSize={20}
    />
  );
}
