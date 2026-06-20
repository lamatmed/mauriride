import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { Ban } from "lucide-react";

export const metadata = { title: "Compte suspendu" };

export default async function SuspendedPage() {
  const session = await auth();

  // If no session or company is now active again, redirect away
  if (!session?.user) redirect("/login");

  if (session.user.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { isActive: true, name: true },
    });
    if (!company || company.isActive) redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto">
          <Ban className="h-10 w-10 text-red-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Compte suspendu
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            L&apos;accès à votre société a été temporairement suspendu par l&apos;administrateur de la plateforme.
          </p>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Contactez le support pour plus d&apos;informations.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
