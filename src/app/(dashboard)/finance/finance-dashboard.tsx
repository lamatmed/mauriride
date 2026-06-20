"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Payment, Expense, CashRegister, Agency, User, Reservation, Passenger, Trip, Route, Parcel } from "@prisma/client";

type PaymentWithRelations = Payment & {
  agent: Pick<User, "name">;
  reservation: (Reservation & {
    passenger: Passenger;
    trip: Trip & { route: Route };
  }) | null;
  parcel: Parcel | null;
};

type ExpenseWithAgency = Expense & { agency: Agency };

interface FinanceData {
  todayRevenue: number;
  todayTransactions: number;
  monthRevenue: number;
  monthTransactions: number;
  todayExpenses: number;
  monthExpenses: number;
  todayProfit: number;
  monthProfit: number;
  recentPayments: PaymentWithRelations[];
  recentExpenses: ExpenseWithAgency[];
  cashRegister: CashRegister | null;
}

const METHOD_KEY_MAP: Record<string, string> = {
  BANK_TRANSFER: "BANK",
};

export function FinanceDashboard({ data }: { data: FinanceData }) {
  const { locale } = useLocale();
  const t  = getT(locale);
  const tf = t.finance;

  const getMethodLabel = (method: string): string => {
    const key = METHOD_KEY_MAP[method] ?? method;
    return (tf.methods as Record<string, string>)[key] ?? method;
  };

  const getCategoryLabel = (cat: string): string =>
    (tf.categories as Record<string, string>)[cat] ?? cat;

  return (
    <div className="space-y-6">
      {/* Cash register status */}
      {data.cashRegister && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          data.cashRegister.isOpen
            ? "bg-emerald-50 border-emerald-200"
            : "bg-muted border-border"
        }`}>
          <div className={`w-3 h-3 rounded-full ${data.cashRegister.isOpen ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <p className="text-sm font-medium">
            {data.cashRegister.isOpen ? tf.cashOpen : tf.cashClosed} —{" "}
            {tf.initialFund.replace("{amount}", formatCurrency(data.cashRegister.openAmount))}
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={tf.revenueToday}
          value={data.todayRevenue}
          format="currency"
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title={tf.netProfitToday}
          value={data.todayProfit}
          format="currency"
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="bg-teal-100 text-teal-600"
        />
        <StatCard
          title={tf.revenueMonth}
          value={data.monthRevenue}
          format="currency"
          icon={<ArrowUpRight className="h-5 w-5" />}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatCard
          title={tf.expensesMonth}
          value={data.monthExpenses}
          format="currency"
          icon={<TrendingDown className="h-5 w-5" />}
          iconColor="bg-red-100 text-red-600"
        />
      </div>

      {/* Transactions + Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              {tf.recentPayments}
              <span className="ms-auto text-sm font-normal text-muted-foreground">
                {data.todayTransactions} {tf.today}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{tf.noPayment}</p>
            ) : (
              data.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {payment.reservation
                        ? `${payment.reservation.passenger.fullName} — ${payment.reservation.trip.route.originCity}→${payment.reservation.trip.route.destinCity}`
                        : payment.parcel
                        ? `${tf.parcel} #${payment.parcel.trackingNumber.substring(0, 10)}`
                        : tf.payment}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{formatDateTime(payment.paidAt)}</span>
                      <Badge variant="neutral" className="text-xs">{getMethodLabel(payment.method)}</Badge>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-emerald-600 flex-shrink-0">
                    +{formatCurrency(payment.amount)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-red-500" />
              {tf.recentExpenses}
              <span className="ms-auto text-sm font-normal text-muted-foreground">
                {formatCurrency(data.todayExpenses)} {tf.today}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{tf.noExpenses}</p>
            ) : (
              data.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <ArrowDownLeft className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{formatDateTime(expense.date)}</span>
                      <Badge variant="destructive" className="text-xs">
                        {getCategoryLabel(expense.category)}
                      </Badge>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-red-500 flex-shrink-0">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tf.monthlySummary}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.monthRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">{tf.grossRevenue}</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-red-500">{formatCurrency(data.monthExpenses)}</p>
              <p className="text-sm text-muted-foreground mt-1">{tf.totalExpenses}</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${data.monthProfit >= 0 ? "text-teal-600" : "text-red-600"}`}>
                {formatCurrency(data.monthProfit)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{tf.netProfit}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
