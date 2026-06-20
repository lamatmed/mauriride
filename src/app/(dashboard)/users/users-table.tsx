"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getInitials } from "@/lib/utils";
import { ROLE_COLORS } from "@/lib/permissions";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { User, Agency, Company, UserRole } from "@prisma/client";

type UserRow = User & { agency: Agency | null; company: Company | null };

export function UsersTable({ users }: { users: UserRow[] }) {
  const { locale } = useLocale();
  const t = getT(locale);
  const tu = t.users;
  const ts = t.status;

  const columns = useMemo<ColumnDef<UserRow>[]>(() => [
    {
      accessorKey: "name",
      header: tu.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(row.original.name)}
          </div>
          <div>
            <p className="font-medium text-sm">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: tu.role,
      cell: ({ row }) => {
        const role = row.original.role as UserRole;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role]}`}>
            {(t.roles as Record<string, string>)[role] ?? role}
          </span>
        );
      },
    },
    {
      accessorKey: "agency.name",
      header: tu.agency,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.agency?.name ?? row.original.company?.name ?? "—"}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: tu.phone,
      cell: ({ row }) => (
        <span className="text-sm font-mono" dir="ltr">{row.original.phone ?? "—"}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: tu.status,
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "success" : "neutral"} dot>
          {row.original.isActive ? ts.active : ts.inactive}
        </Badge>
      ),
    },
    {
      accessorKey: "lastLoginAt",
      header: tu.lastLogin,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.lastLoginAt ? formatDate(row.original.lastLoginAt) : tu.never}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/users/${row.original.id}`}>
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
      data={users}
      searchKey="name"
      searchPlaceholder={tu.search}
      pageSize={20}
    />
  );
}
