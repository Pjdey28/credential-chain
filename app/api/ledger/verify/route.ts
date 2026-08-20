import {
  NextRequest,
  NextResponse,
} from "next/server";

import { verifyLedger } from "../../../../lib/ledger";

export async function GET(
  _request: NextRequest
) {
  try {
    const result =
      await verifyLedger();

    return NextResponse.json({
      success: true,
      ledger: result,
    });
  } catch (error) {
    console.error(
      "Ledger verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to verify ledger.",
      },
      {
        status: 500,
      }
    );
  }
}