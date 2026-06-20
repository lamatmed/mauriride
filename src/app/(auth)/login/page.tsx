import { prisma } from "@/lib/prisma";
import { LoginClient } from "./login-client";

export default async function LoginPage() {
  const [agencyCount, companyCount] = await Promise.all([
    prisma.agency.count({ where: { isActive: true } }),
    prisma.company.count(),
  ]);
  return <LoginClient agencyCount={agencyCount} companyCount={companyCount} />;
}
