import {
  describe,
  expect,
  it,
} from "vitest";

import {
  generateIssuerKeyPair,
  hashCredential,
  signCredential,
  verifyCredentialSignature,
} from "../lib/crypto";

describe("Credential Issuance", () => {
  const credential = {
    studentName: "Pranjal Dey",
    studentId: "CH22B001",
    degree: "B.Tech",
    branch: "Chemical Engineering",
    institution: "NIT Rourkela",
    graduationYear: 2026,
    cgpa: 8.72,
    issueDate:
      "2026-08-20T10:00:00.000Z",
  };

  it("creates a stable credential identity", () => {
    const hash =
      hashCredential(credential);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("creates a valid digital signature", () => {
    const keyPair =
      generateIssuerKeyPair();

    const hash =
      hashCredential(credential);

    const signature =
      signCredential(
        hash,
        keyPair.privateKey
      );

    expect(
      verifyCredentialSignature(
        hash,
        signature,
        keyPair.publicKey
      )
    ).toBe(true);
  });

  it("rejects altered credential information", () => {
    const keyPair =
      generateIssuerKeyPair();

    const originalHash =
      hashCredential(credential);

    const signature =
      signCredential(
        originalHash,
        keyPair.privateKey
      );

    const modifiedCredential = {
      ...credential,
      cgpa: 9.72,
    };

    const modifiedHash =
      hashCredential(
        modifiedCredential
      );

    expect(modifiedHash).not.toBe(
      originalHash
    );

    expect(
      verifyCredentialSignature(
        modifiedHash,
        signature,
        keyPair.publicKey
      )
    ).toBe(false);
  });
});