import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH — toggle isActive (block / unblock)
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERVISEUR")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id }, select: { isActive: true } });
  if (!company) return NextResponse.json({ error: "Société introuvable" }, { status: 404 });

  const updated = await prisma.company.update({
    where: { id },
    data: { isActive: !company.isActive },
  });

  return NextResponse.json({ success: true, isActive: updated.isActive });
}
