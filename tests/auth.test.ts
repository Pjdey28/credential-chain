import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "../lib/auth";

describe("Authentication", () => {
  it("hashes and verifies a password", () => {
    const hash = hashPassword("StrongPassword123");

    expect(hash).not.toBe("StrongPassword123");
    expect(hash).toContain(":");
    expect(verifyPassword("StrongPassword123", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("StrongPassword123");

    expect(verifyPassword("WrongPassword123", hash)).toBe(false);
  });

  it("uses a different salt for each password hash", () => {
    const first = hashPassword("StrongPassword123");
    const second = hashPassword("StrongPassword123");

    expect(first).not.toBe(second);
    expect(verifyPassword("StrongPassword123", first)).toBe(true);
    expect(verifyPassword("StrongPassword123", second)).toBe(true);
  });
});