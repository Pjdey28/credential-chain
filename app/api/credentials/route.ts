import { NextRequest, NextResponse } from "next/server";

import { issueCredential } from "@/lib/credential";
import { prisma } from "@/lib/prisma";
import { issueCredentialSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest
) {
  try {
    const user = await getCurrentUser();

    if (!user?.issuerId) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const searchParams =
      request.nextUrl.searchParams;

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      searchParams.get("status");

    const credentials =
      await prisma.credential.findMany({
        where: {
          issuerId: user.issuerId,
          AND: [
            search
              ? {
                  OR: [
                    {
                      credentialId: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                    {
                      studentName: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                    {
                      studentId: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  ],
                }
              : {},

            status &&
            ["ACTIVE", "REVOKED", "EXPIRED"].includes(
              status
            )
              ? {
                  status:
                    status as
                      | "ACTIVE"
                      | "REVOKED"
                      | "EXPIRED",
                }
              : {},
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          issuer: {
            select: {
              name: true,
              code: true,
            },
          },

          ledgerBlock: {
            select: {
              blockIndex: true,
              currentHash: true,
              previousHash: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      credentials,
      count: credentials.length,
    });
  } catch (error) {
    console.error(
      "Credential listing error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to retrieve credentials.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const user = await getCurrentUser();

    if (!user?.issuerId) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

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
      await issueCredential(parsed.data, user.issuerId);

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