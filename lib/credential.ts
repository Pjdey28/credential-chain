import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";

import { prisma } from "./prisma";
import {
  hashCredential,
  signCredential,
} from "./crypto";
import { addBlock } from "./ledger";
import { getDefaultIssuer } from "./issuer";
import type { IssueCredentialInput } from "./validation";

function buildCredentialPayload(
  input: IssueCredentialInput,
  issueDate: Date
) {
  return {
    studentName: input.studentName,
    studentId: input.studentId,
    degree: input.degree,
    branch: input.branch,
    institution: input.institution,
    graduationYear: input.graduationYear,
    cgpa: input.cgpa ?? null,
    issueDate: issueDate.toISOString(),
  };
}

function generateCredentialId(): string {
  const year = new Date().getFullYear();

  return `CRD-${year}-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
}

export async function issueCredential(
  input: IssueCredentialInput,
  issuerId?: string
) {
  const issuer = issuerId
    ? await prisma.issuer.findUnique({ where: { id: issuerId } })
    : await getDefaultIssuer();

  if (!issuer) {
    throw new Error("Issuer not found.");
  }

  const issueDate = new Date();

  const credentialPayload = buildCredentialPayload(
    input,
    issueDate
  );

  const credentialHash =
    hashCredential(credentialPayload);

  const digitalSignature = signCredential(
    credentialHash,
    issuer.privateKey
  );

  const credentialId = generateCredentialId();

  const credential = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const createdCredential =
        await tx.credential.create({
          data: {
            credentialId,
            issuerId: issuer.id,

            studentName: input.studentName,
            studentId: input.studentId,
            degree: input.degree,
            branch: input.branch,
            institution: input.institution,
            graduationYear: input.graduationYear,
            cgpa: input.cgpa ?? null,

            issueDate,
            status: "ACTIVE",

            credentialHash,
            digitalSignature,
          },
        });

      const latestBlock =
        await tx.ledgerBlock.findFirst({
          orderBy: {
            blockIndex: "desc",
          },
        });

      const blockIndex = latestBlock
        ? latestBlock.blockIndex + 1
        : 0;

      const previousHash = latestBlock
        ? latestBlock.currentHash
        : "0".repeat(64);

      const {
        hashBlock,
      } = await import("./crypto");

      const currentHash = hashBlock(
        blockIndex,
        credentialHash,
        previousHash,
        issueDate
      );

      await tx.ledgerBlock.create({
        data: {
          blockIndex,
          credentialId,
          dataHash: credentialHash,
          previousHash,
          currentHash,
          timestamp: issueDate,
          issuerId: issuer.id,
        },
      });

      await tx.auditEvent.create({
        data: {
          credentialId,
          eventType: "CREDENTIAL_ISSUED",
          description:
            "Academic credential issued and recorded in the ledger.",
          metadata: JSON.stringify({
            credentialId,
            issuerCode: issuer.code,
            blockIndex,
            credentialHash,
          }),
        },
      });

      return createdCredential;
    }
  );

  return credential;
}

export async function getCredential(
  credentialId: string
) {
  return prisma.credential.findUnique({
    where: {
      credentialId,
    },
    include: {
      issuer: {
        select: {
          id: true,
          name: true,
          code: true,
          publicKey: true,
        },
      },
      ledgerBlock: true,
    },
  });
}