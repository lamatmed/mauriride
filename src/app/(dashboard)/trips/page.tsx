import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TripsTable } from "./trips-table";
import { TripsHeader } from "@/components/trips/trips-header";

export const metadata = { title: "Trajets" };

async function getTrips(agencyId: string | null, companyId: string | null) {
  return prisma.trip.findMany({
    where: agencyId
      ? { departureAgencyId: agencyId }
      : companyId
      ? { departureAgency: { companyId } }
      : {},
    include: {
      route: true,
      bus: true,
      driver: { select: { name: true } },
      departureAgency: true,
      arrivalAgency: true,
      _count: { select: { reservations: true, parcels: true } },
    },
    orderBy: { departureTime: "desc" },
    take: 200,
  });
}

export default async function TripsPage() {
  const session = await auth();
  const trips = await getTrips(
    session?.user?.agencyId ?? null,
    session?.user?.companyId ?? null
  );

  return (
    <div className="animate-fade-in">
      <TripsHeader count={trips.length} />
      <div className="p-6">
        <TripsTable trips={trips} />
      </div>
    </div>
  );
}
