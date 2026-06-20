"use client";

import { Building2, Users, Bus, TrendingUp, CheckCircle, XCircle, Plus } from "lucide-react";
import { CompanyActions } from "@/components/supervisor/company-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export interface OverviewCompany {
  id: string;
  name: string;
  nameAr: string | null;
  logo: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  adminName: string | null;
  adminEmail: string | null;
  adminLastLoginAt: string | null;
  agencyCount: number;
  revenueToday: number;
  revenueMonthly: number;
  revenueTotal: number;
}

interface Props {
  userName: string;
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalBuses: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  companies: OverviewCompany[];
}

export function SupervisorOverview({
  userName,
  totalCompanies,
  activeCompanies,
  totalUsers,
  totalBuses,
  todayRevenue,
  monthlyRevenue,
  totalRevenue,
  companies,
}: Props) {
  const { locale } = useLocale();
  const t = getT(locale).supervisor.overview;
  const isAr = locale === "ar";

  const firstName = userName.split(" ")[0];

  const kpis = [
    {
      label: t.activeCompanies,
      value: `${activeCompanies} / ${totalCompanies}`,
      icon: Building2,
      color: "bg-violet-100 text-violet-600",
    },
    {
      label: t.totalUsers,
      value: totalUsers,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: t.activeBuses,
      value: totalBuses,
      icon: Bus,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: t.revenueToday,
      value: formatCurrency(todayRevenue),
      icon: TrendingUp,
      color: "bg-teal-100 text-teal-600",
      sub: `${t.thisMonth} : ${formatCurrency(monthlyRevenue)} · ${t.totalCumul} : ${formatCurrency(totalRevenue)}`,
    },
  ];

  const subtitle = t.subtitle
    .replace("{name}", firstName)
    .replace("{count}", String(totalCompanies));

  return (
    <div className="p-8 space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Link href="/supervisor/companies/new">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            {t.newCompany}
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">{kpi.value}</p>
                  {kpi.sub && <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>}
                </div>
                <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Companies table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">{t.tableTitle}</CardTitle>
          <Link href="/supervisor/companies">
            <span className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              {t.manageLink}
            </span>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-start px-6 py-3 font-medium text-muted-foreground">{t.company}</th>
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground">{t.admin}</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">{t.agencies}</th>
                  <th className="text-end px-4 py-3 font-medium text-muted-foreground">{t.revenueToday2}</th>
                  <th className="text-end px-4 py-3 font-medium text-muted-foreground">{t.thisMonth2}</th>
                  <th className="text-end px-6 py-3 font-medium text-muted-foreground">{t.cumulative}</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      {t.noCompanies}
                    </td>
                  </tr>
                )}
                {companies.map((company) => {
                  const displayName = isAr && company.nameAr ? company.nameAr : company.name;
                  return (
                    <tr key={company.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                              <Building2 className="h-4 w-4 text-violet-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{displayName}</p>
                            <p className="text-xs text-muted-foreground">{company.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {company.adminName ? (
                          <div>
                            <p className="font-medium text-foreground">{company.adminName}</p>
                            <p className="text-xs text-muted-foreground">{company.adminEmail}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium">{company.agencyCount}</span>
                      </td>
                      <td className="px-4 py-4 text-end">
                        <span className={company.revenueToday > 0 ? "font-semibold text-teal-600" : "text-muted-foreground"}>
                          {formatCurrency(company.revenueToday)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-end">
                        <span className="font-medium">{formatCurrency(company.revenueMonthly)}</span>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <span className="font-semibold text-foreground">{formatCurrency(company.revenueTotal)}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {company.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                            <CheckCircle className="h-3 w-3" /> {t.statusActive}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                            <XCircle className="h-3 w-3" /> {t.statusSuspended}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <CompanyActions
                          company={{
                            id: company.id,
                            name: company.name,
                            nameAr: company.nameAr,
                            email: company.email,
                            phone: company.phone,
                            address: company.address,
                            isActive: company.isActive,
                            adminEmail: company.adminEmail,
                            adminName: company.adminName,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
