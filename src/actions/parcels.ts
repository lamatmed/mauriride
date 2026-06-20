"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createParcelSchema = z.object({
  senderName: z.string().min(2),
  senderPhone: z.string().min(8),
  receiverName: z.string().min(2),
  receiverPhone: z.string().min(8),
  receiverAgencyId: z.string(),
  description: z.string().optional(),
  weightKg: z.number().min(0.1),
  price: z.number().min(0),
  tripId: z.string().optional(),
  notes: z.string().optional(),
});

export async function createParcel(input: z.infer<typeof createParcelSchema>) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non authentifié" };
  if (!session.user.agencyId) return { success: false, error: "Agence requise" };

  const parsed = createParcelSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  try {
    const parcel = await prisma.parcel.create({
      data: {
        ...parsed.data,
        senderAgencyId: session.user.agencyId,
        status: "RECEIVED",
      },
    });

    await prisma.payment.create({
      data: {
        parcelId: parcel.id,
        agentId: session.user.id,
        amount: parsed.data.price,
        method: "CASH",
        status: "PAID",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Parcel",
        entityId: parcel.id,
        newData: { trackingNumber: parcel.trackingNumber },
      },
    });

    revalidatePath("/parcels");
    return { success: true, id: parcel.id, trackingNumber: parcel.trackingNumber };
  } catch (error) {
    console.error("createParcel error:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateParcelStatus(
  parcelId: string,
  status: "RECEIVED" | "IN_TRANSIT" | "ARRIVED" | "DELIVERED" | "RETURNED"
) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  try {
    await prisma.parcel.update({
      where: { id: parcelId },
      data: {
        status,
        deliveredAt: status === "DELIVERED" ? new Date() : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_STATUS",
        entity: "Parcel",
        entityId: parcelId,
        newData: { status },
      },
    });

    revalidatePath("/parcels");
    return { success: true };
  } catch (error) {
    console.error("updateParcelStatus error:", error);
    return { success: false, error: "Erreur" };
  }
}
