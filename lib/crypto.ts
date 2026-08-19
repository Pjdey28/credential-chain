import {
  createHash,
  generateKeyPairSync,
  privateEncrypt,
  publicDecrypt,
  sign,
  verify,
} from "crypto";

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function generateIssuerKeyPair(): KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519", {
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return {
    publicKey,
    privateKey,
  };
}

export function sha256(data: string): string {
  return createHash("sha256")
    .update(data, "utf8")
    .digest("hex");
}

export function canonicalizeCredential(data: Record<string, unknown>): string {
  return JSON.stringify(
    Object.keys(data)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = data[key];
        return result;
      }, {})
  );
}

export function hashCredential(data: Record<string, unknown>): string {
  return sha256(canonicalizeCredential(data));
}

export function signCredential(
  payload: string,
  privateKey: string
): string {
  const signature = sign(
    null,
    Buffer.from(payload, "utf8"),
    privateKey
  );

  return signature.toString("base64");
}

export function verifyCredentialSignature(
  payload: string,
  signature: string,
  publicKey: string
): boolean {
  return verify(
    null,
    Buffer.from(payload, "utf8"),
    publicKey,
    Buffer.from(signature, "base64")
  );
}

export function hashBlock(
  blockIndex: number,
  dataHash: string,
  previousHash: string,
  timestamp: Date
): string {
  return sha256(
    [
      blockIndex,
      dataHash,
      previousHash,
      timestamp.toISOString(),
    ].join("|")
  );
}