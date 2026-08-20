import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { issueCredential } from "@/lib/credential";
import { issueCredentialSchema } from "@/lib/validation";
import { parseCsv } from "@/lib/csv";

const requiredHeaders = [
  "studentName",
  "studentId",
  "degree",
  "branch",
  "institution",
  "graduationYear",
];

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user?.issuerId) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "A CSV file is required." },
      { status: 400 }
    );
  }

  const rows = parseCsv(await file.text());

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "The CSV file has no data rows." },
      { status: 400 }
    );
  }

  if (rows.length > 100) {
    return NextResponse.json(
      { success: false, error: "Bulk issuance is limited to 100 rows." },
      { status: 400 }
    );
  }

  const missingHeaders = requiredHeaders.filter((header) => !(header in rows[0]));
  if (missingHeaders.length > 0) {
    return NextResponse.json(
      { success: false, error: `Missing CSV columns: ${missingHeaders.join(", ")}.` },
      { status: 400 }
    );
  }

  const issued: { row: number; credentialId: string }[] = [];
  const errors: { row: number; error: string }[] = [];

  for (const [index, row] of rows.entries()) {
    const parsed = issueCredentialSchema.safeParse({
      ...row,
      graduationYear: Number(row.graduationYear),
      cgpa: row.cgpa ? Number(row.cgpa) : undefined,
    });

    if (!parsed.success) {
      errors.push({ row: index + 2, error: parsed.error.issues[0]?.message || "Invalid row." });
      continue;
    }

    try {
      const credential = await issueCredential(parsed.data, user.issuerId);
      issued.push({ row: index + 2, credentialId: credential.credentialId });
    } catch (error) {
      errors.push({ row: index + 2, error: error instanceof Error ? error.message : "Unable to issue row." });
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    issued,
    errors,
    summary: { total: rows.length, issued: issued.length, failed: errors.length },
  }, { status: errors.length === rows.length ? 400 : 200 });
}