import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BoardingInterface } from "./boarding-interface";
import { BoardingHeader } from "@/components/boarding/boarding-header";

export const metadata = { title: "Embarquement" };

async function getActiveTrips(agencyId: string | null, companyId: string | null) {
  return prisma.trip.findMany({
    where: {
      status: { in: ["BOARDING", "SCHEDULED"] },
      departureTime: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      ...(agencyId ? { departureAgencyId: agencyId } : companyId ? { departureAgency: { companyId } } : {}),
    },
    include: {
      route: true,
      bus: true,
      departureAgency: true,
      reservations: {
        include: {
          passenger: true,
          baggage: true,
        },
        where: { status: { not: "CANCELLED" } },
        orderBy: { seatNumber: "asc" },
      },
    },
    orderBy: { departureTime: "asc" },
  });
}

export default async function BoardingPage() {
  const session = await auth();
  const trips = await getActiveTrips(
    session?.user?.agencyId ?? null,
    session?.user?.companyId ?? null
  );

  return (
    <div className="animate-fade-in">
      <BoardingHeader />
      <div className="p-6">
        <BoardingInterface trips={trips} />
      </div>
    </div>
  );
}
