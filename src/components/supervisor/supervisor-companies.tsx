"use client";

import { Building2, Plus, CheckCircle, XCircle, Users, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { CompanyActions } from "@/components/supervisor/company-actions";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

export interface CompanyCard {
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
  userCount: number;
  revenueMonthly: number;
  revenueTotal: number;
}

interface Props {
  companies: CompanyCard[];
}

export function SupervisorCompanies({ companies }: Props) {
  const { locale } = useLocale();
  const t = getT(locale).supervisor.companies;
  const isAr = locale === "ar";

  const subtitle = t.subtitle.replace("{count}", String(companies.length));

  return (
    <div className="p-8 space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Link href="/supervisor/companies/new">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            {t.createCompany}
          </Button>
        </Link>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t.empty}</p>
              <p className="text-muted-foreground text-sm mt-1">{t.emptyHint}</p>
            </div>
            <Link href="/supervisor/companies/new">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <Plus className="h-4 w-4" />
                {t.createCompany}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => {
            const displayName = isAr && company.nameAr ? company.nameAr : company.name;
            const displayNameSecondary = isAr ? company.name : company.nameAr;

            return (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-violet-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base leading-tight">{displayName}</CardTitle>
                        {displayNameSecondary && (
                          <p
                            className="text-xs text-muted-foreground mt-0.5"
                            dir={isAr ? "ltr" : "rtl"}
                          >
                            {displayNameSecondary}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {company.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                          <CheckCircle className="h-3 w-3" /> {t.statusActive}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                          <XCircle className="h-3 w-3" /> {t.statusSuspended}
                        </span>
                      )}
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm">
                        <strong>{company.agencyCount}</strong> {t.agencies}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                      <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm">
                        <strong>{company.userCount}</strong> {t.users}
                      </span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100">
                      <p className="text-[10px] text-teal-600 font-medium uppercase tracking-wide">{t.thisMonth}</p>
                      <p className="text-sm font-bold text-teal-700 mt-0.5">{formatCurrency(company.revenueMonthly)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-violet-50 border border-violet-100">
                      <p className="text-[10px] text-violet-600 font-medium uppercase tracking-wide">{t.totalCumul}</p>
                      <p className="text-sm font-bold text-violet-700 mt-0.5">{formatCurrency(company.revenueTotal)}</p>
                    </div>
                  </div>

                  {/* Admin */}
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground mb-1">{t.admin}</p>
                    {company.adminName ? (
                      <div>
                        <p className="text-sm font-medium text-foreground">{company.adminName}</p>
                        <p className="text-xs text-muted-foreground">{company.adminEmail}</p>
                        {company.adminLastLoginAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t.lastLogin.replace(
                              "{date}",
                              new Date(company.adminLastLoginAt).toLocaleDateString(
                                isAr ? "ar-MR" : "fr-FR"
                              )
                            )}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">{t.noAdmin}</p>
                    )}
                  </div>

                  {(company.email || company.phone) && (
                    <div className="border-t pt-3 space-y-0.5">
                      {company.email && <p className="text-xs text-muted-foreground">{company.email}</p>}
                      {company.phone && <p className="text-xs text-muted-foreground" dir="ltr">{company.phone}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
