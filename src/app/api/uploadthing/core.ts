import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  companyLogo: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Non autorisé");
      if (!["SUPER_ADMIN", "DIRECTOR"].includes(session.user.role)) {
        throw new Error("Accès refusé");
      }
      if (!session.user.companyId) throw new Error("Aucune société");
      return { companyId: session.user.companyId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.company.update({
        where: { id: metadata.companyId },
        data: { logo: file.ufsUrl },
      });
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
