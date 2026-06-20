import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { CommandPalette } from "@/components/layout/command-palette";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "SUPERVISEUR") {
    redirect("/supervisor");
  }

  const company = session.user.companyId
    ? await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { name: true, nameAr: true, logo: true, email: true, phone: true, address: true, isActive: true },
      })
    : null;

  if (company && !company.isActive) {
    redirect("/suspended");
  }

  return (
    <SessionProvider session={session}>
      <SidebarLayout company={company}>{children}</SidebarLayout>
      <CommandPalette />
    </SessionProvider>
  );
}
