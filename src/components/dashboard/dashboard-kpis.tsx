"use client";

import { StatCard } from "@/components/shared/stat-card";
import { Ticket, Users, Package, Bus, DollarSign, TrendingUp, MapPin } from "lucide-react";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

interface Props {
  todayReservations: number;
  reservationsChange?: number;
  todayRevenue: number;
  revenueChange?: number;
  todayParcels: number;
  parcelsChange?: number;
  activeTrips: number;
  totalPassengers: number;
  totalBuses: number;
  occupancyRate: number;
  occupancyChange: number;
  scheduledTripsCount: number;
}

export function DashboardKPIs({
  todayReservations,
  reservationsChange,
  todayRevenue,
  revenueChange,
  todayParcels,
  parcelsChange,
  activeTrips,
  totalPassengers,
  totalBuses,
  occupancyRate,
  occupancyChange,
  scheduledTripsCount,
}: Props) {
  const { locale } = useLocale();
  const t = getT(locale).dashboard;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.reservationsToday}
          value={todayReservations}
          change={reservationsChange}
          changeLabel={t.vsYesterday}
          icon={<Ticket className="h-5 w-5" />}
          iconColor="bg-teal-100 text-teal-600"
          format="number"
        />
        <StatCard
          title={t.revenueToday}
          value={todayRevenue}
          change={revenueChange}
          changeLabel={t.vsYesterday}
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="bg-emerald-100 text-emerald-600"
          format="currency"
        />
        <StatCard
          title={t.parcelsToday}
          value={todayParcels}
          change={parcelsChange}
          changeLabel={t.vsYesterday}
          icon={<Package className="h-5 w-5" />}
          iconColor="bg-blue-100 text-blue-600"
          format="number"
        />
        <StatCard
          title={t.busesActive}
          value={activeTrips}
          icon={<Bus className="h-5 w-5" />}
          iconColor="bg-amber-100 text-amber-600"
          format="number"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.totalPassengers}
          value={totalPassengers}
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-violet-100 text-violet-600"
          format="number"
        />
        <StatCard
          title={t.activeBuses}
          value={totalBuses}
          icon={<Bus className="h-5 w-5" />}
          iconColor="bg-slate-100 text-slate-600"
          format="number"
        />
        <StatCard
          title={t.occupancyRate}
          value={`${occupancyRate}%`}
          change={occupancyChange}
          changeLabel={t.vsLastMonth}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="bg-teal-100 text-teal-600"
          format="raw"
        />
        <StatCard
          title={t.scheduledTrips}
          value={scheduledTripsCount}
          icon={<MapPin className="h-5 w-5" />}
          iconColor="bg-orange-100 text-orange-600"
          format="number"
        />
      </div>
    </>
  );
}
