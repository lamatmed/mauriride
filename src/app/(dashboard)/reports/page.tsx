import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportsDashboard } from "./reports-dashboard";
import { ReportsHeader } from "@/components/reports/reports-header";
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";

export const metadata = { title: "Rapports" };

async function getReportsData(agencyId: string | null, companyId: string | null) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);

  const tripFilter = agencyId
    ? { departureAgencyId: agencyId }
    : companyId
    ? { departureAgency: { companyId } }
    : {};

  const agentFilter = agencyId
    ? { agent: { agencyId } }
    : companyId
    ? { agent: { companyId } }
    : {};

  const routeFilter = companyId ? { companyId } : {};

  const [
    monthlyRevenue,
    lastMonthRevenue,
    yearRevenue,
    monthlyPassengers,
    monthlyParcels,
    topRoutes,
    monthlyTrips,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { ...agentFilter, paidAt: { gte: monthStart, lte: monthEnd }, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { ...agentFilter, paidAt: { gte: lastMonthStart, lte: lastMonthEnd }, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { ...agentFilter, paidAt: { gte: yearStart, lte: yearEnd }, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.reservation.count({
      where: {
        ...(agencyId ? { trip: { departureAgencyId: agencyId } } : companyId ? { trip: { departureAgency: { companyId } } } : {}),
        createdAt: { gte: monthStart, lte: monthEnd },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.parcel.count({
      where: {
        ...(agencyId ? { senderAgencyId: agencyId } : companyId ? { senderAgency: { companyId } } : {}),
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.route.findMany({
      where: routeFilter,
      include: {
        _count: { select: { trips: true } },
        trips: {
          include: { _count: { select: { reservations: true } } },
          where: { status: { not: "CANCELLED" } },
        },
      },
      take: 5,
    }),
    prisma.trip.count({
      where: {
        ...tripFilter,
        departureTime: { gte: monthStart, lte: monthEnd },
        status: { not: "CANCELLED" },
      },
    }),
  ]);

  return {
    monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
    lastMonthRevenue: lastMonthRevenue._sum.amount ?? 0,
    yearRevenue: yearRevenue._sum.amount ?? 0,
    monthlyPassengers,
    monthlyParcels,
    monthlyTrips,
    topRoutes: topRoutes.map((r) => ({
      name: `${r.originCity} → ${r.destinCity}`,
      trips: r._count.trips,
      passengers: r.trips.reduce((s, t) => s + t._count.reservations, 0),
    })),
  };
}

export default async function ReportsPage() {
  const session = await auth();
  const data = await getReportsData(
    session?.user?.agencyId ?? null,
    session?.user?.companyId ?? null
  );

  return (
    <div className="animate-fade-in">
      <ReportsHeader />
      <div className="p-6">
        <ReportsDashboard data={data} />
      </div>
    </div>
  );
}
