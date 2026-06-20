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
import { createParcel } from "@/actions/parcels";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Package, CheckCircle } from "lucide-react";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Agency, Trip, Route, Bus } from "@prisma/client";

const schemaFr = z.object({
  senderName:       z.string().min(2, "Nom requis (min 2 car.)"),
  senderPhone:      z.string().min(8, "Téléphone requis"),
  receiverName:     z.string().min(2, "Nom requis (min 2 car.)"),
  receiverPhone:    z.string().min(8, "Téléphone requis"),
  receiverAgencyId: z.string().min(1, "Agence requise"),
  description:      z.string().optional(),
  weightKg:         z.number().min(0.1, "Poids min. 0.1 kg"),
  price:            z.number().min(0),
  tripId:           z.string().optional(),
  notes:            z.string().optional(),
});

const schemaAr = z.object({
  senderName:       z.string().min(2, "الاسم مطلوب (حرفان على الأقل)"),
  senderPhone:      z.string().min(8, "الهاتف مطلوب"),
  receiverName:     z.string().min(2, "الاسم مطلوب (حرفان على الأقل)"),
  receiverPhone:    z.string().min(8, "الهاتف مطلوب"),
  receiverAgencyId: z.string().min(1, "الوكالة مطلوبة"),
  description:      z.string().optional(),
  weightKg:         z.number().min(0.1, "الوزن 0.1 كغ على الأقل"),
  price:            z.number().min(0),
  tripId:           z.string().optional(),
  notes:            z.string().optional(),
});

type FormData = z.infer<typeof schemaFr>;

const PRICE_PER_KG = 200;

export function NewParcelForm({
  agencies,
  trips,
  agencyId,
}: {
  agencies: Agency[];
  trips: Array<Trip & { route: Route; bus: Bus }>;
  agencyId: string;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getT(locale);
  const tp = t.parcels;
  const isAr = locale === "ar";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weight, setWeight] = useState(1);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(isAr ? schemaAr : schemaFr),
    defaultValues: { weightKg: 1, price: PRICE_PER_KG },
  });

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const w = parseFloat(e.target.value) || 0;
    setWeight(w);
    setValue("weightKg", w);
    setValue("price", Math.round(w * PRICE_PER_KG));
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await createParcel(data);
      if (result.success) {
        router.push(`/parcels/${result.id}`);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl" dir={isAr ? "rtl" : "ltr"}>
      <div className="lg:col-span-2 space-y-4">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-teal-500" />
              {tp.senderSection}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label block mb-1.5">{tp.fullName}</label>
              <Input {...register("senderName")} placeholder="Ahmed Ould..." error={errors.senderName?.message} />
            </div>
            <div>
              <label className="form-label block mb-1.5">{tp.phone}</label>
              <Input {...register("senderPhone")} placeholder="+222 36 00 00 00" dir="ltr" error={errors.senderPhone?.message} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-teal-500" />
              {tp.recipientSection}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label block mb-1.5">{tp.fullName}</label>
              <Input {...register("receiverName")} placeholder="Khadija Mint..." error={errors.receiverName?.message} />
            </div>
            <div>
              <label className="form-label block mb-1.5">{tp.phone}</label>
              <Input {...register("receiverPhone")} placeholder="+222 36 00 00 00" dir="ltr" error={errors.receiverPhone?.message} />
            </div>
            <div className="col-span-2">
              <label className="form-label block mb-1.5">{tp.destAgency}</label>
              <Select onValueChange={(v) => setValue("receiverAgencyId", v)}>
                <SelectTrigger><SelectValue placeholder={tp.selectAgency} /></SelectTrigger>
                <SelectContent>
                  {agencies.filter((a) => a.id !== agencyId).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} — {a.city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.receiverAgencyId && <p className="form-error">{errors.receiverAgencyId.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tp.parcelInfo}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label block mb-1.5">{tp.weightKg}</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={handleWeightChange}
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="form-label block mb-1.5">{tp.priceMRU}</label>
              <Input {...register("price", { valueAsNumber: true })} type="number" readOnly className="bg-muted" />
            </div>
            <div className="col-span-2">
              <label className="form-label block mb-1.5">{tp.description}</label>
              <Input {...register("description")} placeholder={tp.descPlaceholder} />
            </div>
            <div className="col-span-2">
              <label className="form-label block mb-1.5">{tp.tripOptional}</label>
              <Select onValueChange={(v) => setValue("tripId", v)}>
                <SelectTrigger><SelectValue placeholder={tp.selectTrip} /></SelectTrigger>
                <SelectContent>
                  {trips.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.route.originCity} → {t.route.destinCity} — {formatDateTime(t.departureTime)} ({t.bus.plate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="button" className="w-full h-11 text-base" loading={isLoading} onClick={handleSubmit(onSubmit)}>
          <CheckCircle className="h-4 w-4" />
          {tp.saveParcel}
        </Button>
      </div>

      {/* Summary */}
      <Card className="h-fit">
        <CardHeader><CardTitle className="text-sm">{tp.summary}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted rounded-xl p-4 text-center">
            <Package className="h-8 w-8 text-teal-500 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{tp.totalWeight}</p>
            <p className="text-2xl font-bold text-primary">{weight.toFixed(1)} kg</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{tp.ratePerKg}</span>
            <span className="font-medium">{formatCurrency(PRICE_PER_KG)} MRU</span>
          </div>
          <div className="flex items-center justify-between text-sm border-t border-border pt-3">
            <span className="font-semibold">{tp.totalPrice}</span>
            <span className="text-lg font-bold text-teal-600">{formatCurrency(weight * PRICE_PER_KG)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
