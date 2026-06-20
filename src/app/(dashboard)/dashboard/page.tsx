import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardKPIs } from "@/components/dashboard/dashboard-kpis";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ActiveTrips } from "@/components/dashboard/active-trips";
import type { RecentReservation } from "@/components/dashboard/recent-activity";
import type { ActiveTrip } from "@/components/dashboard/active-trips";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns";

async function getDashboardData(agencyId: string | null, companyId: string | null) {
  const today = new Date();
  const todayStart    = startOfDay(today);
  const todayEnd      = endOfDay(today);
  const yesterday     = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd   = endOfDay(yesterday);
  const monthStart    = startOfMonth(today);
  const monthEnd      = endOfMonth(today);
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd   = endOfMonth(subMonths(today, 1));

  const agencyFilter           = agencyId ? { agencyId }                            : companyId ? { agency: { companyId } }                       : {};
  const tripAgencyFilter       = agencyId ? { departureAgencyId: agencyId }         : companyId ? { departureAgency: { companyId } }               : {};
  const reservationTenantFilter = agencyId ? { trip: { departureAgencyId: agencyId } } : companyId ? { trip: { departureAgency: { companyId } } } : {};
  const paymentTenantFilter    = agencyId ? { agent: { agencyId } }                 : companyId ? { agent: { companyId } }                        : {};
  const parcelTenantFilter     = agencyId ? { senderAgencyId: agencyId }            : companyId ? { senderAgency: { companyId } }                 : {};

  const [
    todayReservations, todayParcels, activeTrips, todayRevenue,
    totalPassengers, totalBuses,
    thisMonthReservations, thisMonthTrips, lastMonthReservations, lastMonthTrips,
    yesterdayReservations, yesterdayParcels, yesterdayRevenue,
  ] = await Promise.all([
    prisma.reservation.count({ where: { ...reservationTenantFilter, createdAt: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } } }),
    prisma.parcel.count({ where: { ...parcelTenantFilter, createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.trip.count({ where: { ...tripAgencyFilter, status: "DEPARTED" } }),
    prisma.payment.aggregate({ where: { ...paymentTenantFilter, createdAt: { gte: todayStart, lte: todayEnd }, status: "PAID" }, _sum: { amount: true } }),
    prisma.passenger.count({
      where: agencyId
        ? { reservations: { some: { trip: { departureAgencyId: agencyId } } } }
        : companyId
        ? { reservations: { some: { trip: { departureAgency: { companyId } } } } }
        : {},
    }),
    prisma.bus.count({ where: { status: "ACTIVE", ...(companyId ? { companyId } : {}) } }),
    prisma.reservation.count({ where: { ...reservationTenantFilter, createdAt: { gte: monthStart, lte: monthEnd }, status: { not: "CANCELLED" } } }),
    prisma.trip.findMany({ where: { ...tripAgencyFilter, departureTime: { gte: monthStart, lte: monthEnd }, status: { not: "CANCELLED" } }, select: { bus: { select: { totalSeats: true } } } }),
    prisma.reservation.count({ where: { ...reservationTenantFilter, createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, status: { not: "CANCELLED" } } }),
    prisma.trip.findMany({ where: { ...tripAgencyFilter, departureTime: { gte: lastMonthStart, lte: lastMonthEnd }, status: { not: "CANCELLED" } }, select: { bus: { select: { totalSeats: true } } } }),
    prisma.reservation.count({ where: { ...reservationTenantFilter, createdAt: { gte: yesterdayStart, lte: yesterdayEnd }, status: { not: "CANCELLED" } } }),
    prisma.parcel.count({ where: { ...parcelTenantFilter, createdAt: { gte: yesterdayStart, lte: yesterdayEnd } } }),
    prisma.payment.aggregate({ where: { ...paymentTenantFilter, createdAt: { gte: yesterdayStart, lte: yesterdayEnd }, status: "PAID" }, _sum: { amount: true } }),
  ]);

  const recentReservationsRaw = await prisma.reservation.findMany({
    where: agencyId
      ? { trip: { departureAgencyId: agencyId } }
      : companyId
      ? { trip: { departureAgency: { companyId } } }
      : {},
    include: {
      passenger: true,
      trip: { include: { route: true, departureAgency: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const activeTripsListRaw = await prisma.trip.findMany({
    where: { ...tripAgencyFilter, status: { in: ["BOARDING", "DEPARTED", "SCHEDULED"] } },
    include: {
      route: true,
      bus: true,
      driver: true,
      departureAgency: true,
      arrivalAgency: true,
      _count: { select: { reservations: true } },
    },
    orderBy: { departureTime: "asc" },
    take: 5,
  });

  const agentCompanyFilter = agencyId
    ? Prisma.sql`AND "agentId" IN (SELECT id FROM users WHERE "agencyId" = ${agencyId})`
    : companyId
    ? Prisma.sql`AND "agentId" IN (SELECT id FROM users WHERE "companyId" = ${companyId})`
    : Prisma.empty;

  const revenueData = await prisma.$queryRaw<Array<{ date: string; amount: number }>>`
    SELECT DATE("createdAt") as date, SUM(amount) as amount
    FROM payments
    WHERE status = 'PAID' AND "createdAt" >= NOW() - INTERVAL '7 days'
      ${agentCompanyFilter}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [weeklyRawReservations, weeklyRawParcels, topRoutesRaw] = await Promise.all([
    prisma.reservation.findMany({ where: { ...reservationTenantFilter, createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } }, select: { createdAt: true } }),
    prisma.parcel.findMany({ where: { ...parcelTenantFilter, createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } }),
    prisma.route.findMany({
      where: companyId ? { companyId } : {},
      select: { originCity: true, destinCity: true, trips: { where: { status: { not: "CANCELLED" } }, select: { _count: { select: { reservations: true } } } } },
      take: 10,
    }),
  ]);

  const weeklyMap: Record<string, { date: Date; voyageurs: number; colis: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    weeklyMap[d.toISOString().slice(0, 10)] = { date: new Date(d), voyageurs: 0, colis: 0 };
  }
  for (const r of weeklyRawReservations) {
    const key = r.createdAt.toISOString().slice(0, 10);
    if (weeklyMap[key]) weeklyMap[key].voyageurs++;
  }
  for (const p of weeklyRawParcels) {
    const key = p.createdAt.toISOString().slice(0, 10);
    if (weeklyMap[key]) weeklyMap[key].colis++;
  }

  // Pass dayIndex (0=Sun) instead of name so the client component can translate
  const weeklyData = Object.values(weeklyMap).map(({ date, voyageurs, colis }) => ({
    dayIndex: date.getDay(),
    voyageurs,
    colis,
  }));

  const topRoutes = topRoutesRaw
    .map((r) => ({ name: `${r.originCity.slice(0, 5)} → ${r.destinCity.slice(0, 5)}`, value: r.trips.reduce((s, t) => s + t._count.reservations, 0) }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const thisMonthSeats    = thisMonthTrips.reduce((s, t) => s + t.bus.totalSeats, 0);
  const lastMonthSeats    = lastMonthTrips.reduce((s, t) => s + t.bus.totalSeats, 0);
  const occupancyRate     = thisMonthSeats > 0 ? Math.round((thisMonthReservations / thisMonthSeats) * 100) : 0;
  const lastOccupancyRate = lastMonthSeats > 0 ? Math.round((lastMonthReservations / lastMonthSeats) * 100) : 0;
  const occupancyChange   = occupancyRate - lastOccupancyRate;

  const calcChange = (cur: number, prev: number) =>
    prev === 0 ? undefined : Math.round(((cur - prev) / prev) * 100 * 10) / 10;

  const todayRevenueAmt     = Number(todayRevenue._sum.amount ?? 0);
  const yesterdayRevenueAmt = Number(yesterdayRevenue._sum.amount ?? 0);

  // Serialize for client components
  const recentReservations: RecentReservation[] = recentReservationsRaw.map((r) => ({
    id:         r.id,
    status:     r.status,
    totalPrice: r.totalPrice,
    createdAt:  r.createdAt.toISOString(),
    passenger:  { fullName: r.passenger.fullName },
    trip: { route: { originCity: r.trip.route.originCity, destinCity: r.trip.route.destinCity } },
  }));

  const activeTripsList: ActiveTrip[] = activeTripsListRaw.map((trip) => ({
    id:            trip.id,
    status:        trip.status,
    departureTime: trip.departureTime.toISOString(),
    route:         { originCity: trip.route.originCity, destinCity: trip.route.destinCity },
    bus:           { plate: trip.bus.plate, totalSeats: trip.bus.totalSeats },
    reservationCount: trip._count.reservations,
  }));

  return {
    todayReservations,
    todayParcels,
    activeTrips,
    todayRevenue:         todayRevenueAmt,
    totalPassengers,
    totalBuses,
    occupancyRate,
    occupancyChange,
    reservationsChange:   calcChange(todayReservations, yesterdayReservations),
    parcelsChange:        calcChange(todayParcels, yesterdayParcels),
    revenueChange:        calcChange(todayRevenueAmt, yesterdayRevenueAmt),
    recentReservations,
    activeTripsList,
    revenueData,
    weeklyData,
    topRoutes,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const data    = await getDashboardData(
    session?.user?.agencyId ?? null,
    session?.user?.companyId ?? null,
  );

  return (
    <div className="animate-fade-in">
      <DashboardHeader userName={session?.user?.name ?? ""} />

      <div className="p-6 space-y-6">
        <DashboardKPIs
          todayReservations={data.todayReservations}
          reservationsChange={data.reservationsChange}
          todayRevenue={data.todayRevenue}
          revenueChange={data.revenueChange}
          todayParcels={data.todayParcels}
          parcelsChange={data.parcelsChange}
          activeTrips={data.activeTrips}
          totalPassengers={data.totalPassengers}
          totalBuses={data.totalBuses}
          occupancyRate={data.occupancyRate}
          occupancyChange={data.occupancyChange}
          scheduledTripsCount={data.activeTripsList.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardCharts
              revenueData={data.revenueData}
              weeklyData={data.weeklyData}
              topRoutes={data.topRoutes}
            />
          </div>
          <div>
            <RecentActivity reservations={data.recentReservations} />
          </div>
        </div>

        <ActiveTrips trips={data.activeTripsList} />
      </div>
    </div>
  );
}
