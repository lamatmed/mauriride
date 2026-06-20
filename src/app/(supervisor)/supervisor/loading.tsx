"use client";

import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function SupervisorLoading() {
  const { locale } = useLocale();
  const t = getT(locale);
  const isAr = locale === "ar";

  return (
    <div className="p-8 space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-32" />
        </div>
        {/* Table header */}
        <div className="flex items-center gap-4 px-6 py-3 border-b bg-muted/30">
          {[200, 160, 80, 100, 100, 100, 70, 60].map((w, i) => (
            <Skeleton key={i} className={`h-3.5`} style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
            <div className="space-y-1" style={{ width: 200 }}>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="space-y-1" style={{ width: 160 }}>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-8 mx-auto" style={{ width: 80 }} />
            <Skeleton className="h-4 w-16 ms-auto" style={{ width: 100 }} />
            <Skeleton className="h-4 w-16" style={{ width: 100 }} />
            <Skeleton className="h-4 w-16" style={{ width: 100 }} />
            <Skeleton className="h-6 w-16 rounded-full" style={{ width: 70 }} />
            <Skeleton className="h-6 w-6 rounded" style={{ width: 60 }} />
          </div>
        ))}
      </div>

      {/* Loading label */}
      <p className="text-center text-sm text-muted-foreground animate-pulse">
        {t.common.loading}
      </p>
    </div>
  );
}
