import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name:      z.string().min(2).optional(),
  nameAr:    z.string().optional(),
  email:     z.string().email().optional(),
  adminName: z.string().optional(),
  phone:     z.string().optional(),
  address:   z.string().optional(),
});

async function guard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERVISEUR") return false;
  return true;
}

// PATCH — update company info (email synced to admin user)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await guard()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { email, adminName, ...rest } = parsed.data;

  const adminUpdates = {
    ...(email     ? { email }     : {}),
    ...(adminName ? { name: adminName } : {}),
  };

  const [company] = await prisma.$transaction([
    prisma.company.update({ where: { id }, data: { ...rest, ...(email ? { email } : {}) } }),
    ...(Object.keys(adminUpdates).length > 0
      ? [prisma.user.updateMany({ where: { companyId: id, role: "SUPER_ADMIN" }, data: adminUpdates })]
      : []),
  ]);

  return NextResponse.json({ success: true, company });
}

// DELETE — remove company and all related data
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await guard()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
