import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { SupervisorOverview } from "@/components/supervisor/supervisor-overview";
import type { OverviewCompany } from "@/components/supervisor/supervisor-overview";

export const metadata = { title: "Superviseur — Vue d'ensemble" };

async function getPlatformData() {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const revenueRows = await prisma.$queryRaw<
    Array<{ companyId: string; total: number; monthly: number; today: number }>
  >`
    SELECT
      u."companyId",
      COALESCE(SUM(p.amount), 0)                                                                   AS total,
      COALESCE(SUM(CASE WHEN p."createdAt" >= ${monthStart} AND p."createdAt" <= ${monthEnd}  THEN p.amount ELSE 0 END), 0) AS monthly,
      COALESCE(SUM(CASE WHEN p."createdAt" >= ${todayStart} AND p."createdAt" <= ${todayEnd}  THEN p.amount ELSE 0 END), 0) AS today
    FROM payments p
    JOIN users u ON p."agentId" = u.id
    WHERE p.status = 'PAID' AND u."companyId" IS NOT NULL
    GROUP BY u."companyId"
  `;

  const revenueMap = Object.fromEntries(
    revenueRows.map((r) => [r.companyId, {
      total:   Number(r.total),
      monthly: Number(r.monthly),
      today:   Number(r.today),
    }])
  );

  const [
    totalCompanies,
    activeCompanies,
    totalUsers,
    totalBuses,
    companies,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: { not: "SUPERVISEUR" } } }),
    prisma.bus.count({ where: { status: "ACTIVE" } }),
    prisma.company.findMany({
      include: {
        _count: { select: { agencies: true, users: true } },
        users: {
          where: { role: "SUPER_ADMIN" },
          select: { name: true, email: true, lastLoginAt: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalRevenue   = revenueRows.reduce((s, r) => s + Number(r.total),   0);
  const todayRevenue   = revenueRows.reduce((s, r) => s + Number(r.today),   0);
  const monthlyRevenue = revenueRows.reduce((s, r) => s + Number(r.monthly), 0);

  return { totalCompanies, activeCompanies, totalUsers, totalBuses, totalRevenue, todayRevenue, monthlyRevenue, companies, revenueMap };
}

export default async function SupervisorPage() {
  const session = await auth();
  const data = await getPlatformData();

  const overviewCompanies: OverviewCompany[] = data.companies.map((c) => {
    const rev = data.revenueMap[c.id] ?? { total: 0, monthly: 0, today: 0 };
    const admin = c.users[0];
    return {
      id:                  c.id,
      name:                c.name,
      nameAr:              c.nameAr,
      logo:                c.logo,
      email:               c.email,
      phone:               c.phone,
      address:             c.address,
      isActive:            c.isActive,
      adminName:           admin?.name ?? null,
      adminEmail:          admin?.email ?? null,
      adminLastLoginAt:    admin?.lastLoginAt?.toISOString() ?? null,
      agencyCount:         c._count.agencies,
      revenueToday:        rev.today,
      revenueMonthly:      rev.monthly,
      revenueTotal:        rev.total,
    };
  });

  return (
    <SupervisorOverview
      userName={session?.user?.name ?? ""}
      totalCompanies={data.totalCompanies}
      activeCompanies={data.activeCompanies}
      totalUsers={data.totalUsers}
      totalBuses={data.totalBuses}
      todayRevenue={data.todayRevenue}
      monthlyRevenue={data.monthlyRevenue}
      totalRevenue={data.totalRevenue}
      companies={overviewCompanies}
    />
  );
}
