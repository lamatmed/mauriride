import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewAgencyForm } from "./new-agency-form";
import { NewAgencyHeader } from "@/components/agencies/new-agency-header";

export const metadata = { title: "Nouvelle Agence" };

const ALLOWED_ROLES = ["SUPER_ADMIN", "DIRECTOR"];

export default async function NewAgencyPage() {
  const session = await auth();

  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    redirect("/agencies");
  }

  if (!session.user.companyId) {
    redirect("/agencies");
  }

  return (
    <div className="animate-fade-in">
      <NewAgencyHeader />
      <div className="p-6">
        <NewAgencyForm />
      </div>
    </div>
  );
}
