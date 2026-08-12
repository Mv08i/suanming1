import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const b = await prisma.creditBalance.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json({ balance: b?.balance ?? 0 });
}
