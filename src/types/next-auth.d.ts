import { UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    role: UserRole;
    companyId: string | null;
    agencyId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      companyId: string | null;
      agencyId: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    companyId: string | null;
    agencyId: string | null;
  }
}
