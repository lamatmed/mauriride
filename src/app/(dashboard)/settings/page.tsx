import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import {
  SettingsHeader,
  SettingsCompanyCard,
  SettingsNotificationsCard,
  SettingsLogoCard,
} from "@/components/settings/settings-client";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const session = await auth();
  const [company, userRecord] = await Promise.all([
    session?.user?.companyId
      ? prisma.company.findUnique({
          where: { id: session.user.companyId },
          select: { name: true, nameAr: true, logo: true, email: true, phone: true, address: true },
        })
      : null,
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { lastLoginAt: true },
        })
      : null,
  ]);

  return (
    <div className="animate-fade-in">
      <SettingsHeader />
      <div className="p-6 max-w-3xl space-y-4">
        {company && <SettingsLogoCard logo={company.logo ?? null} />}
        {company && <SettingsCompanyCard company={company} />}
        <ProfileForm lastLoginAt={userRecord?.lastLoginAt ?? null} />
        <PasswordForm />
        <SettingsNotificationsCard />
      </div>
    </div>
  );
}
