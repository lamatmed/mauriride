import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { SupervisorCompanies } from "@/components/supervisor/supervisor-companies";
import type { CompanyCard } from "@/components/supervisor/supervisor-companies";

export const metadata = { title: "Gestion des sociétés" };

export default async function CompaniesPage() {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd   = endOfMonth(today);

  const revenueRows = await prisma.$queryRaw<
    Array<{ companyId: string; total: number; monthly: number }>
  >`
    SELECT
      u."companyId",
      COALESCE(SUM(p.amount), 0) AS total,
      COALESCE(SUM(CASE WHEN p."createdAt" >= ${monthStart} AND p."createdAt" <= ${monthEnd} THEN p.amount ELSE 0 END), 0) AS monthly
    FROM payments p
    JOIN users u ON p."agentId" = u.id
    WHERE p.status = 'PAID' AND u."companyId" IS NOT NULL
    GROUP BY u."companyId"
  `;

  const revenueMap = Object.fromEntries(
    revenueRows.map((r) => [r.companyId, { total: Number(r.total), monthly: Number(r.monthly) }])
  );

  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { agencies: true, users: true } },
      users: {
        where: { role: "SUPER_ADMIN" },
        select: { name: true, email: true, lastLoginAt: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const cards: CompanyCard[] = companies.map((c) => {
    const rev   = revenueMap[c.id] ?? { total: 0, monthly: 0 };
    const admin = c.users[0];
    return {
      id:               c.id,
      name:             c.name,
      nameAr:           c.nameAr,
      logo:             c.logo,
      email:            c.email,
      phone:            c.phone,
      address:          c.address,
      isActive:         c.isActive,
      adminName:        admin?.name ?? null,
      adminEmail:       admin?.email ?? null,
      adminLastLoginAt: admin?.lastLoginAt?.toISOString() ?? null,
      agencyCount:      c._count.agencies,
      userCount:        c._count.users,
      revenueMonthly:   rev.monthly,
      revenueTotal:     rev.total,
    };
  });

  return <SupervisorCompanies companies={cards} />;
}
