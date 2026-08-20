import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { hashBlock, hashCredential, verifyCredentialSignature } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ credentialId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user?.issuerId) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const { credentialId } = await context.params;
  const credential = await prisma.credential.findFirst({
    where: { credentialId, issuerId: user.issuerId },
    include: { issuer: true, ledgerBlock: true },
  });

  if (!credential || !credential.ledgerBlock) {
    return NextResponse.json(
      { success: false, error: "Credential or ledger block not found." },
      { status: 404 }
    );
  }

  const tamperedStudentName = `${credential.studentName} (ALTERED)`;
  const tamperedHash = hashCredential({
    studentName: tamperedStudentName,
    studentId: credential.studentId,
    degree: credential.degree,
    branch: credential.branch,
    institution: credential.institution,
    graduationYear: credential.graduationYear,
    cgpa: credential.cgpa,
    issueDate: credential.issueDate.toISOString(),
  });
  const block = credential.ledgerBlock;

  return NextResponse.json({
    success: true,
    original: {
      studentName: credential.studentName,
      credentialHash: credential.credentialHash,
      signatureValid: verifyCredentialSignature(
        credential.credentialHash,
        credential.digitalSignature,
        credential.issuer.publicKey
      ),
    },
    tampered: {
      studentName: tamperedStudentName,
      credentialHash: tamperedHash,
      hashChanged: tamperedHash !== credential.credentialHash,
      signatureValid: verifyCredentialSignature(
        tamperedHash,
        credential.digitalSignature,
        credential.issuer.publicKey
      ),
      ledgerDataHashMatches: block.dataHash === tamperedHash,
      ledgerBlockValid:
        block.dataHash === tamperedHash &&
        block.currentHash ===
          hashBlock(block.blockIndex, block.dataHash, block.previousHash, block.timestamp),
    },
    persisted: false,
  });
}