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

  const issuerCredentialIds = await prisma.credential.findMany({
    where: { issuerId: user.issuerId },
    select: { credentialId: true },
  });
  const ownedCredentialIds = issuerCredentialIds.map((item) => item.credentialId);

  const [total, active, revoked, ledgerBlocks, verificationCount] =
    await Promise.all([
      prisma.credential.count({ where: { issuerId: user.issuerId } }),
      prisma.credential.count({ where: { issuerId: user.issuerId, status: "ACTIVE" } }),
      prisma.credential.count({ where: { issuerId: user.issuerId, status: "REVOKED" } }),
      prisma.ledgerBlock.count({ where: { issuerId: user.issuerId } }),
      prisma.auditEvent.count({
        where: {
          eventType: "CREDENTIAL_VERIFIED",
          credentialId: { in: ownedCredentialIds },
        },
      }),
    ]);

  return NextResponse.json({
    success: true,
    analytics: {
      totalCredentials: total,
      activeCredentials: active,
      revokedCredentials: revoked,
      verificationActivity: verificationCount,
      ledgerBlocks,
      generatedAt: new Date().toISOString(),
    },
  });
}