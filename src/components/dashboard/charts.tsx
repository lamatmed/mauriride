"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

interface RevenueItem { date: string; amount: number }
interface WeeklyItem  { dayIndex: number; voyageurs: number; colis: number }
interface RouteItem   { name: string; value: number }

const PALETTE = ["#14B8A6", "#0F172A", "#64748b", "#94a3b8", "#cbd5e1"];
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-primary text-white px-3 py-2 rounded-lg shadow-dropdown text-xs">
        {label && <p className="font-semibold mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i}>
            <span className="opacity-70">{p.name}: </span>
            <span className="font-bold">
              {typeof p.value === "number" && p.value > 1000
                ? formatCurrency(p.value)
                : p.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface Props {
  revenueData: RevenueItem[];
  weeklyData: WeeklyItem[];
  topRoutes: RouteItem[];
}

export function DashboardCharts({ revenueData, weeklyData, topRoutes }: Props) {
  const { locale } = useLocale();
  const t = getT(locale).dashboard;

  const chartRevenue = revenueData.map((d) => ({
    date:   formatDate(d.date, "dd/MM"),
    amount: Number(d.amount),
  }));

  const chartWeekly = weeklyData.map((d) => ({
    name:      t.days[DAY_KEYS[d.dayIndex]],
    voyageurs: d.voyageurs,
    colis:     d.colis,
  }));

  return (
    <div className="space-y-4">
      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.revenueChart}</CardTitle>
        </CardHeader>
        <CardContent>
          {chartRevenue.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              {t.noRevenueData}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name={t.chartRevenue}
                  stroke="#14B8A6"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                  dot={{ fill: "#14B8A6", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#14B8A6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bar + Pie */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t.weeklyFrequency}</CardTitle>
          </CardHeader>
          <CardContent>
            {chartWeekly.every((d) => d.voyageurs === 0 && d.colis === 0) ? (
              <div className="h-[140px] flex items-center justify-center text-muted-foreground text-sm">
                {t.noData}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={chartWeekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="voyageurs" name={t.chartPassengers} fill="#14B8A6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="colis"     name={t.chartParcels}    fill="#0F172A" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t.popularRoutes}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {topRoutes.length === 0 ? (
              <div className="h-[140px] flex items-center justify-center text-muted-foreground text-sm">
                {t.noData}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={topRoutes}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {topRoutes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [v, name]} />
                  <Legend
                    formatter={(value) => <span className="text-xs">{value}</span>}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
