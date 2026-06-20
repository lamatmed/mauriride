import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AgencyDetailContent } from "@/components/agencies/agency-detail-content";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agency = await prisma.agency.findUnique({ where: { id }, select: { name: true } });
  return { title: agency?.name ?? "Agence" };
}

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const companyId = session?.user?.companyId;

  const agency = await prisma.agency.findUnique({
    where: { id },
    include: {
      company: true,
      users: {
        select: { id: true, name: true, email: true, role: true, isActive: true },
        orderBy: { name: "asc" },
      },
      departures: {
        where: { status: { not: "CANCELLED" } },
        include: { route: true, _count: { select: { reservations: true } } },
        orderBy: { departureTime: "desc" },
        take: 10,
      },
    },
  });

  if (!agency) notFound();
  if (companyId && agency.companyId !== companyId) notFound();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRevenue = await prisma.payment.aggregate({
    where: {
      agent: { agencyId: id },
      status: "PAID",
      createdAt: { gte: monthStart },
    },
    _sum: { amount: true },
  });

  const serialized = {
    id: agency.id,
    name: agency.name,
    city: agency.city,
    address: agency.address,
    phone: agency.phone,
    email: agency.email,
    isActive: agency.isActive,
    company: { name: agency.company.name },
    users: agency.users,
    departures: agency.departures.map((d) => ({
      id: d.id,
      status: d.status,
      departureTime: d.departureTime.toISOString(),
      route: { originCity: d.route.originCity, destinCity: d.route.destinCity },
      reservationCount: d._count.reservations,
    })),
    monthRevenue: monthRevenue._sum.amount ?? 0,
  };

  return <AgencyDetailContent agency={serialized} />;
}
