import { NextRequest, NextResponse } from "next/server";

import { issueCredential } from "../../../lib/credential";
import { issueCredentialSchema } from "../../../lib/validation";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const parsed =
      issueCredentialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credential data.",
          details: parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const credential =
      await issueCredential(parsed.data);

    return NextResponse.json(
      {
        success: true,
        credential: {
          credentialId:
            credential.credentialId,
          studentName:
            credential.studentName,
          degree:
            credential.degree,
          branch:
            credential.branch,
          institution:
            credential.institution,
          issueDate:
            credential.issueDate,
          status:
            credential.status,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Credential issuance error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to issue credential.",
      },
      {
        status: 500,
      }
    );
  }
}