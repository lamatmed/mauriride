import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationsHeader } from "@/components/reservations/reservations-header";
import { ReservationsTable } from "./reservations-table";

export const metadata = { title: "Réservations" };

async function getReservations(agencyId: string | null, companyId: string | null) {
  return prisma.reservation.findMany({
    where: agencyId
      ? { trip: { departureAgencyId: agencyId } }
      : companyId
      ? { trip: { departureAgency: { companyId } } }
      : {},
    include: {
      passenger: true,
      trip: { include: { route: true, departureAgency: true, bus: true } },
      agent: { select: { name: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export default async function ReservationsPage() {
  const session      = await auth();
  const reservations = await getReservations(
    session?.user?.agencyId ?? null,
    session?.user?.companyId ?? null,
  );

  const stats = {
    total:     reservations.length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    cancelled: reservations.filter((r) => r.status === "CANCELLED").length,
    boarded:   reservations.filter((r) => r.status === "BOARDED").length,
  };

  return (
    <div className="animate-fade-in">
      <ReservationsHeader
        total={stats.total}
        confirmed={stats.confirmed}
        boarded={stats.boarded}
        cancelled={stats.cancelled}
      />
      <div className="p-6 pt-4">
        <ReservationsTable reservations={reservations} />
      </div>
    </div>
  );
}
