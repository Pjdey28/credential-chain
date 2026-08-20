import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { hashBlock, hashCredential, verifyCredentialSignature } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ credentialId: string }>;
}

const editableFields = [
  "studentName",
  "studentId",
  "degree",
  "branch",
  "institution",
  "graduationYear",
  "cgpa",
] as const;

type EditableField = (typeof editableFields)[number];

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user?.issuerId) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const { credentialId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const field = body.field as EditableField;
  const value = body.value;

  if (!editableFields.includes(field) || value === undefined || value === null) {
    return NextResponse.json(
      { success: false, error: "Choose a signed field and provide a replacement value." },
      { status: 400 }
    );
  }

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

  const originalPayload = {
    studentName: credential.studentName,
    studentId: credential.studentId,
    degree: credential.degree,
    branch: credential.branch,
    institution: credential.institution,
    graduationYear: credential.graduationYear,
    cgpa: credential.cgpa,
    issueDate: credential.issueDate.toISOString(),
  };

  const editedValue =
    field === "graduationYear" || field === "cgpa"
      ? Number(value)
      : String(value);

  if (
    (field === "graduationYear" || field === "cgpa") &&
    !Number.isFinite(editedValue)
  ) {
    return NextResponse.json(
      { success: false, error: `${field} must be a valid number.` },
      { status: 400 }
    );
  }

  const tamperedPayload = {
    ...originalPayload,
    [field]: editedValue,
  };
  const tamperedHash = hashCredential(tamperedPayload);
  const block = credential.ledgerBlock;

  return NextResponse.json({
    success: true,
    original: {
      field,
      value: originalPayload[field],
      credentialHash: credential.credentialHash,
      signatureValid: verifyCredentialSignature(
        credential.credentialHash,
        credential.digitalSignature,
        credential.issuer.publicKey
      ),
    },
    tampered: {
      field,
      value: editedValue,
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
