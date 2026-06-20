"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Building2, MapPin, Users, Bus, Phone, Mail, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
interface AgencyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface AgencyDeparture {
  id: string;
  status: string;
  departureTime: string;
  route: { originCity: string; destinCity: string };
  reservationCount: number;
}

interface AgencyDetailData {
  id: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  company: { name: string };
  users: AgencyUser[];
  departures: AgencyDeparture[];
  monthRevenue: number;
}

export function AgencyDetailContent({ agency }: { agency: AgencyDetailData }) {
  const { locale } = useLocale();
  const t  = getT(locale);
  const ta = t.agencies.detail;
  const ts = t.status;

  return (
    <div className="animate-fade-in">
      <Header
        title={agency.name}
        subtitle={agency.city + (agency.address ? ` — ${agency.address}` : "")}
        actions={
          <Link href="/agencies">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              {ta.backButton}
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{ta.agentsCount}</p>
                <p className="text-xl font-bold">{agency.users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bus className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{ta.recentTrips}</p>
                <p className="text-xl font-bold">{agency.departures.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-xs">UM</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{ta.monthRevenue}</p>
                <p className="text-xl font-bold">{formatCurrency(agency.monthRevenue)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{ta.status}</p>
                <Badge variant={agency.isActive ? "success" : "neutral"} dot className="mt-0.5">
                  {agency.isActive ? ts.active : ts.inactive}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Agency details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-500" />
                {ta.infoSection}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {agency.city}{agency.address ? `, ${agency.address}` : ""}
              </div>
              {agency.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span dir="ltr">{agency.phone}</span>
                </div>
              )}
              {agency.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {agency.email}
                </div>
              )}
              <div className="pt-1 border-t border-border">
                <p className="text-muted-foreground">{ta.company}</p>
                <p className="font-medium">{agency.company.name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-500" />
                {ta.teamSection} ({agency.users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {agency.users.length === 0 ? (
                <p className="text-sm text-muted-foreground">{ta.noAgents}</p>
              ) : (
                agency.users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant={u.isActive ? "teal" : "neutral"} className="text-xs">
                      {(t.roles as Record<string, string>)[u.role] ?? u.role}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent trips */}
        {agency.departures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bus className="h-4 w-4 text-teal-500" />
                {ta.tripsSection}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agency.departures.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                    <div>
                      <p className="font-medium">{trip.route.originCity} → {trip.route.destinCity}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(trip.departureTime).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR", {
                          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-medium">{trip.reservationCount} {ta.passengers}</p>
                      <Badge
                        variant={trip.status === "ARRIVED" ? "success" : trip.status === "DEPARTED" ? "teal" : "neutral"}
                        className="text-xs"
                      >
                        {(t.status as Record<string, string>)[trip.status.toLowerCase()] ?? trip.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
