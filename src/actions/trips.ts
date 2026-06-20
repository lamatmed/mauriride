"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createTripSchema = z.object({
  routeId: z.string(),
  busId: z.string(),
  driverId: z.string().optional(),
  departureAgencyId: z.string(),
  arrivalAgencyId: z.string(),
  departureTime: z.string().transform((v) => new Date(v)),
  arrivalTime: z.string().optional().transform((v) => v ? new Date(v) : undefined),
  notes: z.string().optional(),
});

export async function createTrip(input: z.input<typeof createTripSchema>) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  const parsed = createTripSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  try {
    const trip = await prisma.trip.create({
      data: {
        ...parsed.data,
        status: "SCHEDULED",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Trip",
        entityId: trip.id,
      },
    });

    revalidatePath("/trips");
    revalidatePath("/dashboard");
    return { success: true, id: trip.id };
  } catch (error) {
    console.error("createTrip error:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateTripStatus(
  tripId: string,
  status: "SCHEDULED" | "BOARDING" | "DEPARTED" | "ARRIVED" | "CANCELLED"
) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  try {
    await prisma.trip.update({
      where: { id: tripId },
      data: { status },
    });

    revalidatePath("/trips");
    revalidatePath("/boarding");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("updateTripStatus error:", error);
    return { success: false, error: "Erreur" };
  }
}
