"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createReservationSchema = z.object({
  tripId: z.string(),
  passengerId: z.string().optional(),
  passengerName: z.string().optional(),
  passengerPhone: z.string().optional(),
  agentId: z.string(),
  seatNumber: z.number(),
  seatClass: z.enum(["STANDARD", "VIP", "COUCHETTE"]).default("STANDARD"),
});

export async function createReservation(input: z.infer<typeof createReservationSchema>) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  const parsed = createReservationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const data = parsed.data;

  try {
    // Check seat availability
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        tripId: data.tripId,
        seatNumber: data.seatNumber,
        status: { not: "CANCELLED" },
      },
    });

    if (existingReservation) {
      return { success: false, error: "Ce siège est déjà réservé" };
    }

    // Get trip price
    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
      include: { route: true },
    });

    if (!trip) return { success: false, error: "Trajet introuvable" };

    const basePrice = data.seatClass === "VIP"
      ? (trip.route.vipPrice ?? trip.route.basePrice * 1.5)
      : trip.route.basePrice;

    // Upsert passenger
    let passengerId = data.passengerId;
    if (!passengerId && data.passengerName && data.passengerPhone) {
      const passenger = await prisma.passenger.upsert({
        where: { id: `phone_${data.passengerPhone}` },
        create: {
          id: `phone_${data.passengerPhone}`,
          fullName: data.passengerName,
          phone: data.passengerPhone,
        },
        update: {
          fullName: data.passengerName,
        },
      });
      passengerId = passenger.id;
    }

    if (!passengerId) {
      // Create new passenger
      const passenger = await prisma.passenger.create({
        data: {
          fullName: data.passengerName ?? "Passager",
          phone: data.passengerPhone ?? "",
        },
      });
      passengerId = passenger.id;
    }

    const reservation = await prisma.reservation.create({
      data: {
        passengerId,
        tripId: data.tripId,
        agentId: data.agentId,
        seatNumber: data.seatNumber,
        seatClass: data.seatClass,
        basePrice,
        totalPrice: basePrice,
        status: "CONFIRMED",
      },
    });

    // Create payment
    await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        agentId: data.agentId,
        amount: basePrice,
        method: "CASH",
        status: "PAID",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Reservation",
        entityId: reservation.id,
        newData: { passengerId, tripId: data.tripId, seatNumber: data.seatNumber },
      },
    });

    revalidatePath("/reservations");
    revalidatePath("/dashboard");

    return { success: true, id: reservation.id };
  } catch (error) {
    console.error("createReservation error:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function boardPassenger(
  reservationId: string,
  action: "BOARDED" | "NO_SHOW"
) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  try {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: action,
        boardedAt: action === "BOARDED" ? new Date() : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: action === "BOARDED" ? "BOARD" : "NO_SHOW",
        entity: "Reservation",
        entityId: reservationId,
      },
    });

    revalidatePath("/boarding");
    return { success: true };
  } catch (error) {
    console.error("boardPassenger error:", error);
    return { success: false, error: "Erreur" };
  }
}

export async function cancelReservation(reservationId: string, reason?: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) return { success: false, error: "Réservation introuvable" };
    if (reservation.status === "BOARDED") return { success: false, error: "Impossible d'annuler un passager déjà embarqué" };

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED", notes: reason },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CANCEL",
        entity: "Reservation",
        entityId: reservationId,
        newData: { reason },
      },
    });

    revalidatePath("/reservations");
    return { success: true };
  } catch (error) {
    console.error("cancelReservation error:", error);
    return { success: false, error: "Erreur lors de l'annulation" };
  }
}
