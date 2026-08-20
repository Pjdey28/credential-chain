import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyCredential } from "@/lib/verification";

interface RouteContext {
  params: Promise<{ studentId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { studentId } = await context.params;
  const credentials = await prisma.credential.findMany({
    where: { studentId: decodeURIComponent(studentId) },
    orderBy: { issueDate: "desc" },
    include: { issuer: { select: { name: true, code: true } } },
  });

  const wallet = await Promise.all(credentials.map(async (credential) => ({
    credentialId: credential.credentialId,
    degree: credential.degree,
    branch: credential.branch,
    institution: credential.institution,
    graduationYear: credential.graduationYear,
    issueDate: credential.issueDate,
    status: credential.status,
    issuer: credential.issuer,
    verification: await verifyCredential(credential.credentialId),
  })));

  return NextResponse.json({ success: true, studentId, credentials: wallet });
}