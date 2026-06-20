import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({ password: z.string().min(8) });

// PATCH — change SUPER_ADMIN password for this company
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERVISEUR")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Mot de passe invalide (min 8 caractères)" }, { status: 400 });

  const admin = await prisma.user.findFirst({
    where: { companyId: id, role: "SUPER_ADMIN" },
    select: { id: true },
  });
  if (!admin) return NextResponse.json({ error: "Aucun admin trouvé pour cette société" }, { status: 404 });

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({ where: { id: admin.id }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
