import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ParcelsTable } from "./parcels-table";
import { ParcelsHeader } from "@/components/parcels/parcels-header";

export const metadata = { title: "Colis" };

async function getParcels(agencyId: string | null, companyId: string | null) {
  return prisma.parcel.findMany({
    where: agencyId
      ? { senderAgencyId: agencyId }
      : companyId
      ? { senderAgency: { companyId } }
      : {},
    include: {
      senderAgency: true,
      receiverAgency: true,
      trip: { include: { route: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export default async function ParcelsPage() {
  const session = await auth();
  const parcels = await getParcels(
    session?.user?.agencyId ?? null,
    session?.user?.companyId ?? null
  );

  const stats = {
    total: parcels.length,
    received: parcels.filter((p) => p.status === "RECEIVED").length,
    inTransit: parcels.filter((p) => p.status === "IN_TRANSIT").length,
    delivered: parcels.filter((p) => p.status === "DELIVERED").length,
  };

  return (
    <div className="animate-fade-in">
      <ParcelsHeader stats={stats} />
      <div className="p-6">
        <ParcelsTable parcels={parcels} />
      </div>
    </div>
  );
}
