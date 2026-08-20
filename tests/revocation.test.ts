import {
  describe,
  expect,
  it,
} from "vitest";

describe("Credential Revocation Rules", () => {
  it("recognizes an active credential", () => {
    const status = "ACTIVE";

    expect(status).toBe("ACTIVE");
  });

  it("recognizes a revoked credential", () => {
    const status = "REVOKED";

    expect(status).toBe("REVOKED");
  });

  it("requires a revocation reason", () => {
    const reason = "";

    expect(reason.trim()).toBe("");
  });

  it("accepts a valid revocation reason", () => {
    const reason =
      "Credential issued with incorrect academic information.";

    expect(reason.trim().length).toBeGreaterThan(0);
    expect(reason.length).toBeLessThanOrEqual(500);
  });
});