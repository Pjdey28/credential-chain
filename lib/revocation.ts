import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

interface RevocationMetadata {
  reason: string;
  revokedAt: string;
}

export async function revokeCredential(
  credentialId: string,
  reason: string
) {
  const credential =
    await prisma.credential.findUnique({
      where: {
        credentialId,
      },
    });

  if (!credential) {
    throw new Error(
      "Credential not found."
    );
  }

  if (credential.status === "REVOKED") {
    throw new Error(
      "Credential is already revoked."
    );
  }

  const revokedAt = new Date();

  return prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const updatedCredential =
        await tx.credential.update({
          where: {
            credentialId,
          },
          data: {
            status: "REVOKED",
            revokedAt,
            revocationReason: reason,
          },
        });

      await tx.auditEvent.create({
        data: {
          credentialId,
          eventType: "CREDENTIAL_REVOKED",
          description:
            "Academic credential revoked by issuer.",
          metadata: JSON.stringify({
            reason,
            revokedAt:
              revokedAt.toISOString(),
          } satisfies RevocationMetadata),
        },
      });

      return updatedCredential;
    }
  );
}