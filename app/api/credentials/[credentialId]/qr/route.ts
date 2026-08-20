import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getCredential } from "../../../../../lib/credential";
import { generateCredentialQR } from "../../../../../lib/qr";

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

    const qr =
      await generateCredentialQR(
        credentialId
      );

    return NextResponse.json({
      success: true,
      credentialId,
      verificationUrl:
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${encodeURIComponent(credentialId)}`,
      qr,
    });
  } catch (error) {
    console.error(
      "QR generation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to generate QR code.",
      },
      {
        status: 500,
      }
    );
  }
}