import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewReservationHeader } from "@/components/reservations/new-reservation-header";
import { NewReservationForm } from "./new-reservation-form";

export const metadata = { title: "Nouvelle Réservation" };

async function getFormData(agencyId: string | null, companyId: string | null) {
  const [trips, passengers] = await Promise.all([
    prisma.trip.findMany({
      where: {
        status: { in: ["SCHEDULED", "BOARDING"] },
        departureTime: { gte: new Date() },
        ...(agencyId ? { departureAgencyId: agencyId } : companyId ? { departureAgency: { companyId } } : {}),
      },
      include: {
        route: true,
        bus: true,
        departureAgency: true,
        arrivalAgency: true,
        reservations: { select: { seatNumber: true, status: true } },
      },
      orderBy: { departureTime: "asc" },
    }),
    prisma.passenger.findMany({
      where: companyId
        ? { reservations: { some: { trip: { departureAgency: { companyId } } } } }
        : {},
      orderBy: { fullName: "asc" },
      take: 500,
    }),
  ]);
  return { trips, passengers };
}

export default async function NewReservationPage() {
  const session = await auth();
  const { trips, passengers } = await getFormData(
    session?.user?.agencyId ?? null,
    session?.user?.companyId ?? null,
  );

  return (
    <div className="animate-fade-in">
      <NewReservationHeader />
      <div className="p-6">
        <NewReservationForm trips={trips} passengers={passengers} agentId={session!.user.id} />
      </div>
    </div>
  );
}
