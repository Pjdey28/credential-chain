import {
  hashCredential,
  verifyCredentialSignature,
  hashBlock,
} from "./crypto";

import { prisma } from "./prisma";

export interface VerificationResult {
  valid: boolean;
  status:
    | "VALID"
    | "REVOKED"
    | "TAMPERED"
    | "NOT_FOUND";

  credentialId?: string;

  checks: {
    credentialExists: boolean;
    hashValid: boolean;
    signatureValid: boolean;
    ledgerValid: boolean;
    issuerValid: boolean;
    revoked: boolean;
  };

  credential?: {
    studentName: string;
    studentId: string;
    degree: string;
    branch: string;
    institution: string;
    graduationYear: number;
    cgpa: number | null;
    issueDate: Date;
    status: string;
  };

  reason?: string;
}

export async function verifyCredential(
  credentialId: string
): Promise<VerificationResult> {
  const credential =
    await prisma.credential.findUnique({
      where: {
        credentialId,
      },
      include: {
        issuer: true,
        ledgerBlock: true,
      },
    });

  if (!credential) {
    return {
      valid: false,
      status: "NOT_FOUND",
      checks: {
        credentialExists: false,
        hashValid: false,
        signatureValid: false,
        ledgerValid: false,
        issuerValid: false,
        revoked: false,
      },
      reason: "Credential does not exist.",
    };
  }

  const credentialPayload = {
    studentName: credential.studentName,
    studentId: credential.studentId,
    degree: credential.degree,
    branch: credential.branch,
    institution: credential.institution,
    graduationYear: credential.graduationYear,
    cgpa: credential.cgpa,
    issueDate: credential.issueDate.toISOString(),
  };

  const calculatedHash =
    hashCredential(credentialPayload);

  const hashValid =
    calculatedHash === credential.credentialHash;

  const signatureValid = verifyCredentialSignature(
    credential.credentialHash,
    credential.digitalSignature,
    credential.issuer.publicKey
  );

  const issuerValid =
    Boolean(credential.issuer.publicKey);

  let ledgerValid = false;

  if (credential.ledgerBlock) {
    const block = credential.ledgerBlock;

    const expectedCurrentHash = hashBlock(
      block.blockIndex,
      block.dataHash,
      block.previousHash,
      block.timestamp
    );

    ledgerValid =
      block.dataHash === credential.credentialHash &&
      block.currentHash === expectedCurrentHash;
  }

  const revoked =
    credential.status === "REVOKED";

  if (revoked) {
    return {
      valid: false,
      status: "REVOKED",
      credentialId,
      checks: {
        credentialExists: true,
        hashValid,
        signatureValid,
        ledgerValid,
        issuerValid,
        revoked: true,
      },
      credential: {
        studentName: credential.studentName,
        studentId: credential.studentId,
        degree: credential.degree,
        branch: credential.branch,
        institution: credential.institution,
        graduationYear: credential.graduationYear,
        cgpa: credential.cgpa,
        issueDate: credential.issueDate,
        status: credential.status,
      },
      reason:
        credential.revocationReason ??
        "Credential has been revoked.",
    };
  }

  const valid =
    hashValid &&
    signatureValid &&
    ledgerValid &&
    issuerValid;

  return {
    valid,
    status: valid ? "VALID" : "TAMPERED",
    credentialId,

    checks: {
      credentialExists: true,
      hashValid,
      signatureValid,
      ledgerValid,
      issuerValid,
      revoked: false,
    },

    credential: {
      studentName: credential.studentName,
      studentId: credential.studentId,
      degree: credential.degree,
      branch: credential.branch,
      institution: credential.institution,
      graduationYear: credential.graduationYear,
      cgpa: credential.cgpa,
      issueDate: credential.issueDate,
      status: credential.status,
    },

    reason: valid
      ? "Credential passed all authenticity checks."
      : "One or more authenticity checks failed.",
  };
}