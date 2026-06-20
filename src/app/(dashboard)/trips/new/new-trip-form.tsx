"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTrip } from "@/actions/trips";
import { MapPin, Bus, CheckCircle } from "lucide-react";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Route, Bus as BusType, User as UserType, Agency } from "@prisma/client";

const schemaFr = z.object({
  routeId:           z.string().min(1, "Trajet requis"),
  busId:             z.string().min(1, "Bus requis"),
  driverId:          z.string().optional(),
  departureAgencyId: z.string().min(1, "Agence départ requise"),
  arrivalAgencyId:   z.string().min(1, "Agence arrivée requise"),
  departureTime:     z.string().min(1, "Heure de départ requise"),
  arrivalTime:       z.string().optional(),
  notes:             z.string().optional(),
});

const schemaAr = z.object({
  routeId:           z.string().min(1, "المسار مطلوب"),
  busId:             z.string().min(1, "الحافلة مطلوبة"),
  driverId:          z.string().optional(),
  departureAgencyId: z.string().min(1, "وكالة المغادرة مطلوبة"),
  arrivalAgencyId:   z.string().min(1, "وكالة الوصول مطلوبة"),
  departureTime:     z.string().min(1, "وقت المغادرة مطلوب"),
  arrivalTime:       z.string().optional(),
  notes:             z.string().optional(),
});

type FormData = z.infer<typeof schemaFr>;

export function NewTripForm({ routes, buses, drivers, agencies }: {
  routes: Route[];
  buses: BusType[];
  drivers: UserType[];
  agencies: Agency[];
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getT(locale);
  const tt = t.trips;
  const isAr = locale === "ar";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(isAr ? schemaAr : schemaFr),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await createTrip(data);
      if (result.success) {
        router.push(`/trips/${result.id}`);
      } else {
        setError(result.error ?? t.errors.createError);
      }
    } catch {
      setError(t.errors.unexpected);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4" dir={isAr ? "rtl" : "ltr"}>
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-500" />
            {tt.tripRouteSection}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="form-label block mb-1.5">{tt.routeLabel}</label>
            <Select onValueChange={(v) => setValue("routeId", v)}>
              <SelectTrigger><SelectValue placeholder={tt.selectRoute} /></SelectTrigger>
              <SelectContent>
                {routes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.originCity} → {r.destinCity} ({r.distanceKm} km)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.routeId && <p className="form-error">{errors.routeId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label block mb-1.5">{tt.depAgency}</label>
              <Select onValueChange={(v) => setValue("departureAgencyId", v)}>
                <SelectTrigger><SelectValue placeholder={tt.depAgencyPh} /></SelectTrigger>
                <SelectContent>
                  {agencies.map((a) => <SelectItem key={a.id} value={a.id}>{a.city} — {a.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.departureAgencyId && <p className="form-error">{errors.departureAgencyId.message}</p>}
            </div>
            <div>
              <label className="form-label block mb-1.5">{tt.arrAgency}</label>
              <Select onValueChange={(v) => setValue("arrivalAgencyId", v)}>
                <SelectTrigger><SelectValue placeholder={tt.arrAgencyPh} /></SelectTrigger>
                <SelectContent>
                  {agencies.map((a) => <SelectItem key={a.id} value={a.id}>{a.city} — {a.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.arrivalAgencyId && <p className="form-error">{errors.arrivalAgencyId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label block mb-1.5">{tt.depTime}</label>
              <Input type="datetime-local" {...register("departureTime")} error={errors.departureTime?.message} />
            </div>
            <div>
              <label className="form-label block mb-1.5">{tt.arrTime}</label>
              <Input type="datetime-local" {...register("arrivalTime")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bus className="h-4 w-4 text-teal-500" />
            {tt.busDriverSection}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label block mb-1.5">{tt.busLabel}</label>
            <Select onValueChange={(v) => setValue("busId", v)}>
              <SelectTrigger><SelectValue placeholder={tt.selectBus} /></SelectTrigger>
              <SelectContent>
                {buses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.plate} — {b.brand} {b.model} ({b.totalSeats} {tt.seats})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.busId && <p className="form-error">{errors.busId.message}</p>}
          </div>
          <div>
            <label className="form-label block mb-1.5">{tt.driverLabel}</label>
            <Select onValueChange={(v) => setValue("driverId", v)}>
              <SelectTrigger><SelectValue placeholder={tt.selectDriver} /></SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="form-label block mb-1.5">{tt.notes}</label>
            <Input {...register("notes")} placeholder={tt.notesPlaceholder} />
          </div>
        </CardContent>
      </Card>

      <Button type="button" className="w-full h-11 text-base" loading={isLoading} onClick={handleSubmit(onSubmit)}>
        <CheckCircle className="h-4 w-4" />
        {tt.createTrip}
      </Button>
    </div>
  );
}
