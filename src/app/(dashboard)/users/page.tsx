import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "./users-table";
import { UsersHeader } from "@/components/users/users-header";

export const metadata = { title: "Utilisateurs" };

export default async function UsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(session?.user?.companyId ? { companyId: session.user.companyId } : {}),
    },
    include: {
      agency: true,
      company: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in">
      <UsersHeader count={users.length} />
      <div className="p-6">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
