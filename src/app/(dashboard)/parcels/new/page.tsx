import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewParcelForm } from "./new-parcel-form";
import { NewParcelHeader } from "@/components/parcels/new-parcel-header";

export const metadata = { title: "Nouveau Colis" };

export default async function NewParcelPage() {
  const session = await auth();
  const agencyId = session?.user?.agencyId ?? null;
  const companyId = session?.user?.companyId ?? null;

  const [agencies, trips] = await Promise.all([
    prisma.agency.findMany({
      where: { isActive: true, ...(companyId ? { companyId } : {}) },
      orderBy: { city: "asc" },
    }),
    prisma.trip.findMany({
      where: {
        status: { in: ["SCHEDULED", "BOARDING"] },
        departureTime: { gte: new Date() },
        ...(agencyId
          ? { departureAgencyId: agencyId }
          : companyId
          ? { departureAgency: { companyId } }
          : {}),
      },
      include: { route: true, bus: true },
      orderBy: { departureTime: "asc" },
    }),
  ]);

  return (
    <div className="animate-fade-in">
      <NewParcelHeader />
      <div className="p-6">
        <NewParcelForm
          agencies={agencies}
          trips={trips}
          agencyId={agencyId ?? ""}
        />
      </div>
    </div>
  );
}
