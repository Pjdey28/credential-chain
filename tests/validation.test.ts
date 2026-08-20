import {
  describe,
  expect,
  it,
} from "vitest";

import {
  issueCredentialSchema,
} from "../lib/validation";

describe("Credential Validation", () => {
  it("accepts a valid credential", () => {
    const result =
      issueCredentialSchema.safeParse({
        studentName: "Rahul Sharma",
        studentId: "CH22B001",
        degree: "B.Tech",
        branch: "Chemical Engineering",
        institution: "NIT Rourkela",
        graduationYear: 2026,
        cgpa: 8.7,
      });

    expect(result.success).toBe(true);
  });

  it("rejects missing student name", () => {
    const result =
      issueCredentialSchema.safeParse({
        studentName: "",
        studentId: "CH22B001",
        degree: "B.Tech",
        branch: "Chemical Engineering",
        institution: "NIT Rourkela",
        graduationYear: 2026,
      });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid CGPA", () => {
    const result =
      issueCredentialSchema.safeParse({
        studentName: "Rahul Sharma",
        studentId: "CH22B001",
        degree: "B.Tech",
        branch: "Chemical Engineering",
        institution: "NIT Rourkela",
        graduationYear: 2026,
        cgpa: 15,
      });

    expect(result.success).toBe(false);
  });
});