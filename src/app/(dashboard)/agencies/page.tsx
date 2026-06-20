import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AgenciesGrid } from "./agencies-grid";
import { AgenciesHeader } from "@/components/agencies/agencies-header";

export const metadata = { title: "Agences" };

export default async function AgenciesPage() {
  const session = await auth();
  const companyId = session?.user?.companyId ?? null;

  const agencies = await prisma.agency.findMany({
    where: companyId ? { companyId } : {},
    include: {
      company: true,
      _count: { select: { users: true, departures: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in">
      <AgenciesHeader count={agencies.length} />
      <div className="p-6">
        <AgenciesGrid agencies={agencies} />
      </div>
    </div>
  );
}
