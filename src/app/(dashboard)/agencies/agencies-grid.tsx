"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, Bus, Eye } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Agency, Company } from "@prisma/client";

type AgencyRow = Agency & {
  company: Company;
  _count: { users: number; departures: number };
};

export function AgenciesGrid({ agencies }: { agencies: AgencyRow[] }) {
  const { locale } = useLocale();
  const t  = getT(locale).agencies;
  const ts = getT(locale).status;

  if (agencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Building2 className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">{t.empty}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {agencies.map((agency) => (
        <Card key={agency.id} className="group hover:border-teal-300 transition-all hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                <Building2 className="h-6 w-6 text-primary group-hover:text-teal-600 transition-colors" />
              </div>
              <Badge variant={agency.isActive ? "success" : "neutral"} dot>
                {agency.isActive ? ts.active : ts.inactive}
              </Badge>
            </div>

            <div>
              <h3 className="font-bold text-primary">{agency.name}</h3>
              <p className="text-sm text-teal-600 font-medium">{agency.company.name}</p>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {agency.city}{agency.address ? `, ${agency.address}` : ""}
              </div>
              {agency.phone && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>📞</span> <span dir="ltr">{agency.phone}</span>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-muted rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                  <Users className="h-3 w-3" /> {t.agents}
                </div>
                <p className="text-sm font-bold text-primary">{agency._count.users}</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                  <Bus className="h-3 w-3" /> {t.trips}
                </div>
                <p className="text-sm font-bold text-primary">{agency._count.departures}</p>
              </div>
            </div>

            <div className="mt-4">
              <Link href={`/agencies/${agency.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-3.5 w-3.5" />
                  {t.viewAgency}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
