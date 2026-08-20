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

    await prisma.auditEvent.create({
      data: {
        credentialId,
        eventType: "CREDENTIAL_VERIFIED",
        description: `Credential verification returned ${result.status}.`,
        metadata: JSON.stringify({
          status: result.status,
          valid: result.valid,
          checks: result.checks,
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
        verification: result,
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