import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewTripForm } from "./new-trip-form";
import { NewTripHeader } from "@/components/trips/new-trip-header";

export const metadata = { title: "Nouveau Trajet" };

export default async function NewTripPage() {
  const session = await auth();
  const companyId = session?.user?.companyId ?? null;

  const [routes, buses, drivers, agencies] = await Promise.all([
    prisma.route.findMany({
      where: { isActive: true, ...(companyId ? { companyId } : {}) },
      orderBy: [{ originCity: "asc" }, { destinCity: "asc" }],
    }),
    prisma.bus.findMany({
      where: { status: "ACTIVE", ...(companyId ? { companyId } : {}) },
      orderBy: { plate: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "DRIVER", isActive: true, ...(companyId ? { companyId } : {}) },
      orderBy: { name: "asc" },
    }),
    prisma.agency.findMany({
      where: { isActive: true, ...(companyId ? { companyId } : {}) },
      orderBy: { city: "asc" },
    }),
  ]);

  return (
    <div className="animate-fade-in">
      <NewTripHeader />
      <div className="p-6">
        <NewTripForm routes={routes} buses={buses} drivers={drivers} agencies={agencies} />
      </div>
    </div>
  );
}
