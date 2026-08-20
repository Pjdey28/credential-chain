import { NextRequest, NextResponse } from "next/server";

import { verifyCredential } from "@/lib/verification";

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