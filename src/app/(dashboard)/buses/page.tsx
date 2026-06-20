import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusesGrid } from "./buses-grid";
import { BusesHeader } from "@/components/buses/buses-header";

export const metadata = { title: "Bus" };

export default async function BusesPage() {
  const session = await auth();
  const companyId = session?.user?.companyId ?? null;

  const buses = await prisma.bus.findMany({
    where: companyId ? { companyId } : {},
    include: {
      _count: { select: { trips: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in">
      <BusesHeader count={buses.length} />
      <div className="p-6">
        <BusesGrid buses={buses} />
      </div>
    </div>
  );
}
