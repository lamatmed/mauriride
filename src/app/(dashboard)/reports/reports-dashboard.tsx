"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { DollarSign, Users, Package, Bus, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

interface ReportsData {
  monthlyRevenue: number;
  lastMonthRevenue: number;
  yearRevenue: number;
  monthlyPassengers: number;
  monthlyParcels: number;
  monthlyTrips: number;
  topRoutes: Array<{ name: string; trips: number; passengers: number }>;
}

export function ReportsDashboard({ data }: { data: ReportsData }) {
  const { locale } = useLocale();
  const t  = getT(locale);
  const tr = t.reports;

  const revenueGrowth = data.lastMonthRevenue > 0
    ? Math.round(((data.monthlyRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={tr.revenueMonth}
          value={data.monthlyRevenue}
          change={revenueGrowth}
          changeLabel={tr.vsLastMonth}
          format="currency"
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title={tr.passengersMonth}
          value={data.monthlyPassengers}
          format="number"
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatCard
          title={tr.parcelsMonth}
          value={data.monthlyParcels}
          format="number"
          icon={<Package className="h-5 w-5" />}
          iconColor="bg-amber-100 text-amber-600"
        />
        <StatCard
          title={tr.tripsMonth}
          value={data.monthlyTrips}
          format="number"
          icon={<Bus className="h-5 w-5" />}
          iconColor="bg-teal-100 text-teal-600"
        />
      </div>

      {/* Annual */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{tr.annualRevenue}</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(data.yearRevenue)}</p>
            </div>
            <div className="ms-auto text-end">
              <p className="text-sm text-muted-foreground">{tr.currentMonth}</p>
              <p className="text-xl font-bold text-teal-600">{formatCurrency(data.monthlyRevenue)}</p>
              {revenueGrowth !== 0 && (
                <p className={`text-xs font-medium ${revenueGrowth > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {revenueGrowth > 0 ? "▲" : "▼"} {Math.abs(revenueGrowth)}% {tr.vsLastMonth}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-500" />
              {tr.topRoutes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topRoutes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">{tr.noData}</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.topRoutes} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatNumber(value),
                      name === "passengers" ? tr.passengers : name
                    ]}
                  />
                  <Bar dataKey="passengers" name="passengers" fill="#14B8A6" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Route list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tr.routeDetail}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topRoutes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">{tr.noData}</p>
            ) : (
              <div className="space-y-3">
                {data.topRoutes.map((route, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{route.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {route.trips} {tr.tripsPassengers.replace("{count}", formatNumber(route.passengers))}
                      </p>
                    </div>
                    <div className="w-20">
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{
                            width: `${Math.min((route.passengers / Math.max(...data.topRoutes.map((r) => r.passengers))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
