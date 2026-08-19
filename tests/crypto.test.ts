import {
  describe,
  expect,
  it,
} from "vitest";

import {
  generateIssuerKeyPair,
  hashCredential,
  hashBlock,
  signCredential,
  verifyCredentialSignature,
} from "../lib/crypto";

describe("Cryptographic Functions", () => {
  it("generates an issuer key pair", () => {
    const keyPair = generateIssuerKeyPair();

    expect(keyPair.publicKey).toContain("PUBLIC KEY");
    expect(keyPair.privateKey).toContain("PRIVATE KEY");
  });

  it("produces deterministic credential hashes", () => {
    const credential = {
      studentName: "Rahul Sharma",
      studentId: "CH22B001",
      degree: "B.Tech",
      branch: "Chemical Engineering",
      institution: "NIT Rourkela",
      graduationYear: 2026,
      cgpa: 8.7,
    };

    const hash1 = hashCredential(credential);
    const hash2 = hashCredential(credential);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("changes the credential hash when data changes", () => {
    const credential = {
      studentName: "Rahul Sharma",
      studentId: "CH22B001",
      degree: "B.Tech",
      branch: "Chemical Engineering",
      institution: "NIT Rourkela",
      graduationYear: 2026,
      cgpa: 8.7,
    };

    const originalHash = hashCredential(credential);

    const modifiedHash = hashCredential({
      ...credential,
      cgpa: 9.7,
    });

    expect(modifiedHash).not.toBe(originalHash);
  });

  it("signs and verifies a credential", () => {
    const keyPair = generateIssuerKeyPair();

    const payload = "credential-hash-example";

    const signature = signCredential(
      payload,
      keyPair.privateKey
    );

    const isValid = verifyCredentialSignature(
      payload,
      signature,
      keyPair.publicKey
    );

    expect(isValid).toBe(true);
  });

  it("rejects a modified signed payload", () => {
    const keyPair = generateIssuerKeyPair();

    const signature = signCredential(
      "original-payload",
      keyPair.privateKey
    );

    const isValid = verifyCredentialSignature(
      "modified-payload",
      signature,
      keyPair.publicKey
    );

    expect(isValid).toBe(false);
  });

  it("produces deterministic block hashes", () => {
    const timestamp = new Date(
      "2026-08-20T10:00:00.000Z"
    );

    const hash1 = hashBlock(
      1,
      "abc123",
      "previousHash",
      timestamp
    );

    const hash2 = hashBlock(
      1,
      "abc123",
      "previousHash",
      timestamp
    );

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });
});