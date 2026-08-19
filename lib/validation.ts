import { z } from "zod";

export const issueCredentialSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(2, "Student name is required"),

  studentId: z
    .string()
    .trim()
    .min(2, "Student ID is required"),

  degree: z
    .string()
    .trim()
    .min(2, "Degree is required"),

  branch: z
    .string()
    .trim()
    .min(2, "Branch is required"),

  institution: z
    .string()
    .trim()
    .min(2, "Institution is required"),

  graduationYear: z
    .number()
    .int()
    .min(1900)
    .max(2100),

  cgpa: z
    .number()
    .min(0)
    .max(10)
    .optional(),
});

export const revokeCredentialSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Revocation reason is required"),
});

export type IssueCredentialInput = z.infer<
  typeof issueCredentialSchema
>;