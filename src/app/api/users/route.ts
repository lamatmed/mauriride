import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const ALLOWED_ROLES: UserRole[] = ["SUPER_ADMIN", "DIRECTOR", "AGENCY_MANAGER"];

const CREATABLE_ROLES: UserRole[] = [
  "DIRECTOR", "AGENCY_MANAGER", "AGENT", "CASHIER", "CONTROLLER", "DRIVER",
];

const schema = z.object({
  name:      z.string().min(2, "Nom requis"),
  email:     z.string().email("Email invalide"),
  password:  z.string().min(6, "Mot de passe min 6 caractères"),
  role:      z.enum(["DIRECTOR", "AGENCY_MANAGER", "AGENT", "CASHIER", "CONTROLLER", "DRIVER"]),
  phone:     z.string().optional(),
  agencyId:  z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role as UserRole)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "Aucune société associée" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, email, password, role, phone, agencyId } = parsed.data;

  // DIRECTOR cannot create another DIRECTOR
  if (session.user.role === "DIRECTOR" && role === "DIRECTOR") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  // Validate agencyId belongs to this company
  if (agencyId) {
    const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency || agency.companyId !== companyId) {
      return NextResponse.json({ error: "Agence invalide" }, { status: 400 });
    }
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      phone:     phone || null,
      companyId,
      agencyId:  agencyId || null,
      isActive:  true,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ success: true, user }, { status: 201 });
}
