import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.issuerId) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const blocks = await prisma.ledgerBlock.findMany({
    where: { issuerId: user.issuerId },
    orderBy: { blockIndex: "asc" },
    select: {
      blockIndex: true,
      credentialId: true,
      dataHash: true,
      previousHash: true,
      currentHash: true,
      timestamp: true,
      credential: {
        select: { studentName: true, degree: true, status: true },
      },
    },
  });

  return NextResponse.json({ success: true, blocks });
}