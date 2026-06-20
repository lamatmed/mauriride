"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { createReservation } from "@/actions/reservations";
import { Bus, Users, MapPin, CheckCircle } from "lucide-react";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Trip, Route, Bus as BusType, Agency, Passenger, Reservation } from "@prisma/client";

const schemaFr = z.object({
  tripId:         z.string().min(1, "Sélectionnez un trajet"),
  passengerId:    z.string().optional(),
  passengerName:  z.string().min(2, "Nom requis (min 2 car.)").optional(),
  passengerPhone: z.string().min(8, "Téléphone requis (min 8 car.)").optional(),
  seatNumber:     z.number().min(1, "Sélectionnez un siège"),
  seatClass:      z.enum(["STANDARD", "VIP", "COUCHETTE"]).default("STANDARD"),
});

const schemaAr = z.object({
  tripId:         z.string().min(1, "اختر الرحلة"),
  passengerId:    z.string().optional(),
  passengerName:  z.string().min(2, "الاسم مطلوب (حرفان على الأقل)").optional(),
  passengerPhone: z.string().min(8, "الهاتف مطلوب (8 أرقام على الأقل)").optional(),
  seatNumber:     z.number().min(1, "اختر المقعد"),
  seatClass:      z.enum(["STANDARD", "VIP", "COUCHETTE"]).default("STANDARD"),
});

type FormData = z.infer<typeof schemaFr>;

type TripWithRelations = Trip & {
  route: Route;
  bus: BusType;
  departureAgency: Agency;
  arrivalAgency: Agency;
  reservations: Array<Pick<Reservation, "seatNumber" | "status">>;
};

export function NewReservationForm({
  trips,
  passengers,
  agentId,
}: {
  trips: TripWithRelations[];
  passengers: Passenger[];
  agentId: string;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const t  = getT(locale);
  const tr = t.reservations;
  const isAr = locale === "ar";

  const [isLoading, setIsLoading]                 = useState(false);
  const [error, setError]                         = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId]       = useState<string>("");
  const [selectedSeat, setSelectedSeat]           = useState<number | null>(null);
  const [useExistingPassenger, setUseExistingPassenger] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(isAr ? schemaAr : schemaFr),
  });

  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const takenSeats   = selectedTrip?.reservations
    .filter((r) => r.status !== "CANCELLED")
    .map((r) => r.seatNumber) ?? [];

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await createReservation({ ...data, agentId, seatNumber: selectedSeat! });
      if (result.success) {
        router.push(`/reservations/${result.id}`);
      } else {
        setError(result.error ?? t.errors.createError);
      }
    } catch {
      setError(t.errors.unexpected);
    } finally {
      setIsLoading(false);
    }
  };

  const seatGrid = useMemo(() => {
    if (!selectedTrip) return [];
    return Array.from({ length: selectedTrip.bus.totalSeats }, (_, i) => i + 1);
  }, [selectedTrip]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl" dir={isAr ? "rtl" : "ltr"}>
      {/* Form */}
      <div className="lg:col-span-2 space-y-4">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Trip */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              {tr.selectTrip}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedTripId}
              onValueChange={(v) => {
                setSelectedTripId(v);
                setValue("tripId", v);
                setSelectedSeat(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={tr.chooseTrip} />
              </SelectTrigger>
              <SelectContent>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{trip.route.originCity} → {trip.route.destinCity}</span>
                      <span className="text-muted-foreground text-xs">{formatDateTime(trip.departureTime)}</span>
                      <span className="text-xs font-mono">{trip.bus.plate}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tripId && <p className="text-xs text-destructive mt-1">{errors.tripId.message}</p>}
          </CardContent>
        </Card>

        {/* Step 2: Seat */}
        {selectedTrip && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                {tr.selectSeat}
                <span className="ms-auto text-sm font-normal text-muted-foreground">
                  {takenSeats.length}/{selectedTrip.bus.totalSeats} {tr.seatOccupied}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-muted border border-border inline-block" />
                  {tr.seatFree}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-red-100 border border-red-300 inline-block" />
                  {tr.seatOccupied}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-teal-500 inline-block" />
                  {tr.seatSelected}
                </span>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                {seatGrid.map((seat) => {
                  const isTaken    = takenSeats.includes(seat);
                  const isSelected = selectedSeat === seat;
                  return (
                    <button
                      key={seat}
                      type="button"
                      disabled={isTaken}
                      onClick={() => { setSelectedSeat(seat); setValue("seatNumber", seat); }}
                      className={`w-full aspect-square rounded text-xs font-semibold transition-all
                        ${isTaken    ? "bg-red-100 text-red-400 cursor-not-allowed border border-red-200"
                        : isSelected ? "bg-teal-500 text-white shadow-md scale-105"
                        : "bg-muted border border-border hover:border-teal-400 hover:bg-teal-50 text-foreground"}`}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Passenger */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              {tr.passengerInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 mb-4">
              <Button type="button" variant={useExistingPassenger ? "outline" : "default"} size="sm" onClick={() => setUseExistingPassenger(false)}>
                {tr.newPassenger}
              </Button>
              <Button type="button" variant={useExistingPassenger ? "default" : "outline"} size="sm" onClick={() => setUseExistingPassenger(true)}>
                {tr.existingPassenger}
              </Button>
            </div>

            {useExistingPassenger ? (
              <Select onValueChange={(v) => setValue("passengerId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={tr.searchPassenger} />
                </SelectTrigger>
                <SelectContent>
                  {passengers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.fullName} — <span dir="ltr">{p.phone}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label block mb-1.5">{tr.fullName}</label>
                  <Input {...register("passengerName")} placeholder="Mohamed Ould Ahmed" error={errors.passengerName?.message} />
                </div>
                <div>
                  <label className="form-label block mb-1.5">{tr.phone}</label>
                  <Input {...register("passengerPhone")} placeholder="+222 00 00 00 00" type="tel" dir="ltr" error={errors.passengerPhone?.message} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="button"
          className="w-full h-11 text-base"
          loading={isLoading}
          disabled={!selectedSeat || !selectedTripId}
          onClick={handleSubmit(onSubmit)}
        >
          <CheckCircle className="h-4 w-4" />
          {tr.confirmReservation}
        </Button>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{tr.summary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedTrip ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-teal-500 shrink-0" />
                  <span className="font-medium">{selectedTrip.route.originCity} → {selectedTrip.route.destinCity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bus className="h-4 w-4 text-teal-500 shrink-0" />
                  <span>{selectedTrip.bus.plate} — {selectedTrip.bus.totalSeats} {tr.seats}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-teal-500 shrink-0" />
                  <span>{selectedTrip.departureAgency.name}</span>
                </div>
                {selectedSeat && (
                  <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl">
                    <p className="text-xs text-teal-600 font-medium">{tr.seatSelectedLabel}</p>
                    <p className="text-2xl font-bold text-teal-600 mt-1">{selectedSeat}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{tr.ticketPrice}</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(selectedTrip.route.basePrice)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{tr.selectTripFirst}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
