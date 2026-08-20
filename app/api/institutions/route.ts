import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const issuers = await prisma.issuer.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, institutions: issuers });
}