import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinanceDashboard } from "./finance-dashboard";
import { FinanceHeader } from "@/components/finance/finance-header";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export const metadata = { title: "Finances" };

async function getFinanceData(agencyId: string | null) {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const filter = agencyId ? { agent: { agencyId } } : {};

  const [
    todayPayments,
    monthPayments,
    todayExpenses,
    monthExpenses,
    recentPayments,
    recentExpenses,
    cashRegister,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { ...filter, paidAt: { gte: todayStart, lte: todayEnd }, status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { ...filter, paidAt: { gte: monthStart, lte: monthEnd }, status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { ...(agencyId ? { agencyId } : {}), date: { gte: todayStart, lte: todayEnd } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { ...(agencyId ? { agencyId } : {}), date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      where: { ...filter },
      include: {
        agent: { select: { name: true } },
        reservation: { include: { passenger: true, trip: { include: { route: true } } } },
        parcel: true,
      },
      orderBy: { paidAt: "desc" },
      take: 20,
    }),
    prisma.expense.findMany({
      where: { ...(agencyId ? { agencyId } : {}) },
      include: { agency: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    agencyId
      ? prisma.cashRegister.findFirst({
          where: { agencyId, isOpen: true },
          orderBy: { openedAt: "desc" },
        })
      : null,
  ]);

  return {
    todayRevenue: todayPayments._sum.amount ?? 0,
    todayTransactions: todayPayments._count,
    monthRevenue: monthPayments._sum.amount ?? 0,
    monthTransactions: monthPayments._count,
    todayExpenses: todayExpenses._sum.amount ?? 0,
    monthExpenses: monthExpenses._sum.amount ?? 0,
    todayProfit: (todayPayments._sum.amount ?? 0) - (todayExpenses._sum.amount ?? 0),
    monthProfit: (monthPayments._sum.amount ?? 0) - (monthExpenses._sum.amount ?? 0),
    recentPayments,
    recentExpenses,
    cashRegister,
  };
}

export default async function FinancePage() {
  const session = await auth();
  const data = await getFinanceData(session?.user?.agencyId ?? null);

  return (
    <div className="animate-fade-in">
      <FinanceHeader />
      <div className="p-6">
        <FinanceDashboard data={data} />
      </div>
    </div>
  );
}
