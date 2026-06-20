"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime, getInitials } from "@/lib/utils";
import { CheckCircle, XCircle, Luggage, Bus, MapPin, Clock } from "lucide-react";
import { boardPassenger } from "@/actions/reservations";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Trip, Route, Bus as BusType, Agency, Reservation, Passenger, Baggage } from "@prisma/client";

type TripWithPassengers = Trip & {
  route: Route;
  bus: BusType;
  departureAgency: Agency;
  reservations: Array<
    Reservation & {
      passenger: Passenger;
      baggage: Baggage[];
    }
  >;
};

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "border-l-blue-400 bg-blue-50/30",
  BOARDED:   "border-l-emerald-400 bg-emerald-50/30",
  NO_SHOW:   "border-l-red-400 bg-red-50/30",
  PENDING:   "border-l-amber-400 bg-amber-50/30",
};

export function BoardingInterface({ trips }: { trips: TripWithPassengers[] }) {
  const { locale } = useLocale();
  const t = getT(locale).boarding;
  const isAr = locale === "ar";

  const [selectedTrip, setSelectedTrip] = useState<TripWithPassengers | null>(trips[0] ?? null);
  const [localReservations, setLocalReservations] = useState(selectedTrip?.reservations ?? []);
  const [isPending, startTransition] = useTransition();

  const handleTripSelect = (trip: TripWithPassengers) => {
    setSelectedTrip(trip);
    setLocalReservations(trip.reservations);
  };

  const handleBoard = (reservationId: string, action: "BOARDED" | "NO_SHOW") => {
    startTransition(async () => {
      await boardPassenger(reservationId, action);
      setLocalReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: action } : r))
      );
    });
  };

  const boarded = localReservations.filter((r) => r.status === "BOARDED").length;
  const total   = localReservations.length;

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Bus className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">{t.noTrips}</p>
        <p className="text-sm mt-1">{t.noTripsHint}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Trips selector */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t.tripsCount.replace("{count}", String(trips.length))}
        </h2>
        {trips.map((trip) => {
          const isSelected  = selectedTrip?.id === trip.id;
          const tripBoarded = trip.reservations.filter((r) => r.status === "BOARDED").length;
          return (
            <button
              key={trip.id}
              type="button"
              onClick={() => handleTripSelect(trip)}
              className={`w-full text-start p-4 rounded-xl border transition-all ${
                isSelected
                  ? "border-teal-400 bg-teal-50 shadow-sm"
                  : "border-border bg-white hover:border-teal-200 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">
                  {trip.route.originCity.substring(0, 4)} → {trip.route.destinCity.substring(0, 4)}
                </p>
                <Badge variant={isSelected ? "teal" : "neutral"} dot>
                  {tripBoarded}/{trip.reservations.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDateTime(trip.departureTime)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{trip.bus.plate}</p>
            </button>
          );
        })}
      </div>

      {/* Passenger list */}
      <div className="lg:col-span-3">
        {selectedTrip && (
          <>
            {/* Trip header */}
            <Card className="mb-4">
              <CardContent className="py-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Bus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        {selectedTrip.route.originCity} → {selectedTrip.route.destinCity}
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDateTime(selectedTrip.departureTime)}
                        </span>
                        <span className="font-mono">{selectedTrip.bus.plate}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {selectedTrip.departureAgency.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="text-end">
                    <div className="text-3xl font-bold text-teal-600">{boarded}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.boardedCount.replace("{count}", String(total))}
                    </div>
                    <div className="w-24 h-2 bg-border rounded-full mt-1 ms-auto">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: total > 0 ? `${(boarded / total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {localReservations.map((reservation) => {
                const isBoarded  = reservation.status === "BOARDED";
                const isNoShow   = reservation.status === "NO_SHOW";
                const hasBaggage = reservation.baggage.length > 0;

                return (
                  <div
                    key={reservation.id}
                    className={`border-s-4 border rounded-xl p-4 transition-all ${
                      STATUS_COLORS[reservation.status] ?? "border-s-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isBoarded ? "bg-emerald-500 text-white" : isNoShow ? "bg-red-400 text-white" : "bg-primary text-white"
                      }`}>
                        {getInitials(reservation.passenger.fullName)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm truncate">{reservation.passenger.fullName}</p>
                          <span className="text-xs font-mono bg-primary/5 px-2 py-0.5 rounded flex-shrink-0">
                            {t.seat.replace("{number}", String(reservation.seatNumber))}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground" dir="ltr">{reservation.passenger.phone}</p>
                        {hasBaggage && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                            <Luggage className="h-3 w-3" />
                            {t.baggage
                              .replace("{weight}", reservation.baggage.reduce((s, b) => s + b.weightKg, 0).toFixed(1))}
                            {" "}({reservation.baggage.length})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {!isBoarded && !isNoShow && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="success"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                          disabled={isPending}
                          onClick={() => handleBoard(reservation.id, "BOARDED")}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {t.boardButton}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          disabled={isPending}
                          onClick={() => handleBoard(reservation.id, "NO_SHOW")}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {t.absentButton}
                        </Button>
                      </div>
                    )}

                    {isBoarded && (
                      <div className="flex items-center gap-2 mt-3 text-emerald-600 text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t.boardedSuccess}
                      </div>
                    )}

                    {isNoShow && (
                      <div className="flex items-center gap-2 mt-3 text-red-500 text-xs font-medium">
                        <XCircle className="h-3.5 w-3.5" />
                        {t.absentMark}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
