import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewUserForm } from "./new-user-form";
import { NewUserHeader } from "@/components/users/new-user-header";

export const metadata = { title: "Nouvel utilisateur" };

const ALLOWED_ROLES = ["SUPER_ADMIN", "DIRECTOR", "AGENCY_MANAGER"];

export default async function NewUserPage() {
  const session = await auth();

  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    redirect("/users");
  }

  const companyId = session.user.companyId;
  if (!companyId) redirect("/users");

  const agencies = await prisma.agency.findMany({
    where: { companyId, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true },
  });

  return (
    <div className="animate-fade-in">
      <NewUserHeader />
      <div className="p-6">
        <NewUserForm agencies={agencies as any} />
      </div>
    </div>
  );
}
