import { NextRequest, NextResponse } from "next/server";

import { getCredential } from "../../../../lib/credential";

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

    const credential =
      await getCredential(credentialId);

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          error: "Credential not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      credential,
    });
  } catch (error) {
    console.error(
      "Credential retrieval error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to retrieve credential.",
      },
      {
        status: 500,
      }
    );
  }
}