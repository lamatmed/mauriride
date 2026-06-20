import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SupervisorSidebar } from "@/components/supervisor/supervisor-sidebar";
import { SessionProvider } from "next-auth/react";

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPERVISEUR") redirect("/dashboard");

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-background overflow-hidden">
        <SupervisorSidebar user={session.user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
