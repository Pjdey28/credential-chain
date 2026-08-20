import { NextRequest, NextResponse } from "next/server";

import { verifyCredential } from "../../../../../lib/verification";
import { prisma } from "../../../../../lib/prisma";

interface RouteContext {
  params: Promise<{
    credentialId: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { credentialId } =
      await context.params;

    if (!credentialId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Credential ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await verifyCredential(
        credentialId
      );

    const recentVerificationCount = await prisma.auditEvent.count({
      where: {
        credentialId,
        eventType: "CREDENTIAL_VERIFIED",
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    const fraudSignals = {
      hashMismatch: result.checks.credentialExists && !result.checks.hashValid,
      signatureFailure: result.checks.credentialExists && !result.checks.signatureValid,
      ledgerMismatch: result.checks.credentialExists && !result.checks.ledgerValid,
      revokedCredential: result.checks.revoked,
      unknownIssuer: result.checks.credentialExists && !result.checks.issuerValid,
      abnormalRepeatedVerification: recentVerificationCount >= 20,
      recentVerificationCount,
    };

    await prisma.auditEvent.create({
      data: {
        credentialId,
        eventType: "CREDENTIAL_VERIFIED",
        description: `Credential verification returned ${result.status}.`,
        metadata: JSON.stringify({
          status: result.status,
          valid: result.valid,
          checks: result.checks,
          fraudSignals,
        }),
      },
    });

    const httpStatus =
      result.status === "NOT_FOUND"
        ? 404
        : 200;

    return NextResponse.json(
      {
        success: true,
        verification: { ...result, fraudSignals },
      },
      {
        status: httpStatus,
      }
    );
  } catch (error) {
    console.error(
      "Verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to verify credential.",
      },
      {
        status: 500,
      }
    );
  }
}