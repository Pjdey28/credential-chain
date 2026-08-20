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

  const credentialIds = await prisma.credential.findMany({
    where: { issuerId: user.issuerId },
    select: { credentialId: true },
  });
  const ownedIds = new Set(credentialIds.map((item) => item.credentialId));

  const events = await prisma.auditEvent.findMany({
    where: {
      OR: [
        { credentialId: null },
        { credentialId: { in: [...ownedIds] } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    success: true,
    events,
  });
}