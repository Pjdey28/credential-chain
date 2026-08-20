import {
  NextRequest,
  NextResponse,
} from "next/server";

import { revokeCredential } from "@/lib/revocation";

interface RouteContext {
  params: Promise<{
    credentialId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { credentialId } =
      await context.params;

    const body = await request.json();

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    if (!reason) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A revocation reason is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (reason.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Revocation reason is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const credential =
      await revokeCredential(
        credentialId,
        reason
      );

    return NextResponse.json({
      success: true,
      credential: {
        credentialId:
          credential.credentialId,
        status:
          credential.status,
        revokedAt:
          credential.revokedAt,
        revocationReason:
          credential.revocationReason,
      },
    });
  } catch (error) {
    console.error(
      "Credential revocation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to revoke credential.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}