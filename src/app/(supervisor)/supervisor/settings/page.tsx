import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/app/(dashboard)/settings/profile-form";
import { PasswordForm } from "@/app/(dashboard)/settings/password-form";
import { SupervisorSettingsHeader } from "./settings-header";

export const metadata = { title: "Paramètres — Superviseur" };

export default async function SupervisorSettingsPage() {
  const session = await auth();

  const userRecord = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { lastLoginAt: true },
      })
    : null;

  return (
    <div className="animate-fade-in">
      <SupervisorSettingsHeader />
      <div className="p-6 max-w-2xl space-y-4">
        <ProfileForm lastLoginAt={userRecord?.lastLoginAt ?? null} />
        <PasswordForm />
      </div>
    </div>
  );
}
