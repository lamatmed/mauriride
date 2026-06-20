import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BaggageTable } from "./baggage-table";
import { BaggageHeader } from "@/components/baggage/baggage-header";

export const metadata = { title: "Bagages" };

export default async function BaggagePage() {
  const session = await auth();
  const agencyId = session?.user?.agencyId ?? null;
  const companyId = session?.user?.companyId ?? null;

  const baggages = await prisma.baggage.findMany({
    where: agencyId
      ? { reservation: { trip: { departureAgencyId: agencyId } } }
      : companyId
      ? { reservation: { trip: { departureAgency: { companyId } } } }
      : {},
    include: {
      reservation: {
        include: {
          passenger: true,
          trip: { include: { route: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const stats = {
    total: baggages.length,
    registered: baggages.filter((b) => b.status === "REGISTERED").length,
    loaded: baggages.filter((b) => b.status === "LOADED").length,
    delivered: baggages.filter((b) => b.status === "DELIVERED").length,
    totalWeight: baggages.reduce((s, b) => s + b.weightKg, 0),
  };

  return (
    <div className="animate-fade-in">
      <BaggageHeader stats={stats} />
      <div className="p-6">
        <BaggageTable baggages={baggages} />
      </div>
    </div>
  );
}
