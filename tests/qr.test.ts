import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
} from "vitest";

import {
  buildVerificationUrl,
} from "../lib/qr";

describe("QR Verification URL", () => {
  beforeEach(() => {
    vi.stubEnv(
      "NEXT_PUBLIC_APP_URL",
      "http://localhost:3000"
    );
  });

  it("creates the correct verification URL", () => {
    const url =
      buildVerificationUrl(
        "CRD-2026-ABC123"
      );

    expect(url).toBe(
      "http://localhost:3000/verify/CRD-2026-ABC123"
    );
  });

  it("encodes the credential identifier", () => {
    const url =
      buildVerificationUrl(
        "CRD-2026/ABC 123"
      );

    expect(url).toContain(
      "CRD-2026%2FABC%20123"
    );
  });
});