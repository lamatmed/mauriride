import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  companyName:    z.string().min(2),
  companyNameAr:  z.string().optional(),
  companyPhone:   z.string().optional(),
  companyAddress: z.string().optional(),
  adminName:      z.string().min(2),
  adminEmail:     z.string().email(),
  adminPassword:  z.string().min(8),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERVISEUR")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });

  const { companyName, companyNameAr, companyPhone, companyAddress, adminName, adminEmail, adminPassword } = parsed.data;

  // Email de la société = email de l'admin
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing)
    return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 });

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const company = await prisma.company.create({
    data: {
      name:    companyName,
      nameAr:  companyNameAr || null,
      email:   adminEmail,        // email société = email admin
      phone:   companyPhone   || null,
      address: companyAddress || null,
      isActive: true,
      users: {
        create: {
          name:     adminName,
          email:    adminEmail,
          password: hashedPassword,
          role:     "SUPER_ADMIN",
          isActive: true,
        },
      },
    },
    include: { users: true },
  });

  return NextResponse.json({ success: true, companyId: company.id }, { status: 201 });
}
