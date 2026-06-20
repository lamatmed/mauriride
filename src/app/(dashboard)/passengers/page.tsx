import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PassengersTable } from "./passengers-table";
import { PassengersHeader } from "@/components/passengers/passengers-header";

export const metadata = { title: "Voyageurs" };

export default async function PassengersPage() {
  const session = await auth();
  const agencyId = session?.user?.agencyId ?? null;
  const companyId = session?.user?.companyId ?? null;

  const passengers = await prisma.passenger.findMany({
    where: agencyId
      ? { reservations: { some: { trip: { departureAgencyId: agencyId } } } }
      : companyId
      ? { reservations: { some: { trip: { departureAgency: { companyId } } } } }
      : {},
    include: {
      _count: { select: { reservations: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="animate-fade-in">
      <PassengersHeader count={passengers.length} />
      <div className="p-6">
        <PassengersTable passengers={passengers} />
      </div>
    </div>
  );
}
