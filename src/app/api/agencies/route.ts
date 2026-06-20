import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ALLOWED_ROLES = ["SUPER_ADMIN", "DIRECTOR"];

const schema = z.object({
  name:    z.string().min(2, "Nom requis"),
  city:    z.string().min(2, "Ville requise"),
  address: z.string().optional(),
  phone:   z.string().optional(),
  email:   z.string().email("Email invalide").optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "Aucune société associée à ce compte" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, city, address, phone, email } = parsed.data;

  const agency = await prisma.agency.create({
    data: {
      companyId,
      name,
      city,
      address: address || null,
      phone:   phone   || null,
      email:   email   || null,
      isActive: true,
    },
  });

  return NextResponse.json({ success: true, agencyId: agency.id }, { status: 201 });
}
