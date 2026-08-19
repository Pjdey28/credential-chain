import { prisma } from "./prisma";
import { generateIssuerKeyPair } from "./crypto";

export async function createIssuer(
  name: string,
  code: string
) {
  const existingIssuer = await prisma.issuer.findUnique({
    where: {
      code,
    },
  });

  if (existingIssuer) {
    return existingIssuer;
  }

  const keyPair = generateIssuerKeyPair();

  return prisma.issuer.create({
    data: {
      name,
      code,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
    },
  });
}

export async function getIssuerByCode(code: string) {
  return prisma.issuer.findUnique({
    where: {
      code,
    },
  });
}

export async function getDefaultIssuer() {
  let issuer = await prisma.issuer.findUnique({
    where: {
      code: "NITR",
    },
  });

  if (!issuer) {
    issuer = await createIssuer(
      "National Institute of Technology Rourkela",
      "NITR"
    );
  }

  return issuer;
}