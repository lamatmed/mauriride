"use client";

import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import { AppLogoIcon } from "@/components/ui/app-logo";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function DashboardLoading() {
  const { locale } = useLocale();
  const t = getT(locale);
  const isAr = locale === "ar";

  return (
    <div className="p-8 space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Logo + chargement */}
      <div className="flex items-center justify-center py-6">
        <div className="flex flex-col items-center gap-4">
          <AppLogoIcon size="lg" />
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-7 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Content card */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-full max-w-[200px]" />
              <Skeleton className="h-4 w-full max-w-[160px]" />
              <Skeleton className="h-4 w-16 ms-auto" />
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground animate-pulse">
        {t.common.loading}
      </p>
    </div>
  );
}
