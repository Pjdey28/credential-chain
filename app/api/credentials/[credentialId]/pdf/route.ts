import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ credentialId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user?.issuerId) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const { credentialId } = await context.params;
  const credential = await prisma.credential.findFirst({
    where: { credentialId, issuerId: user.issuerId },
    include: { issuer: true, ledgerBlock: true },
  });

  if (!credential) {
    return NextResponse.json(
      { success: false, error: "Credential not found." },
      { status: 404 }
    );
  }

  const document = new PDFDocument({ size: "A4", margin: 54 });
  const chunks: Buffer[] = [];
  document.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
  });

  document.fontSize(10).fillColor("#2563eb").text("CREDENTIALCHAIN", { characterSpacing: 2 });
  document.moveDown(1.5);
  document.fontSize(24).fillColor("#111827").text("Academic Credential");
  document.moveDown(0.5);
  document.fontSize(11).fillColor("#4b5563").text("Digitally signed and recorded in the institutional integrity ledger.");
  document.moveDown(2);

  document.fontSize(10).fillColor("#6b7280").text("CREDENTIAL ID");
  document.fontSize(14).fillColor("#111827").text(credential.credentialId);
  document.moveDown(1.2);

  const fields = [
    ["Student Name", credential.studentName],
    ["Student ID", credential.studentId],
    ["Degree", credential.degree],
    ["Branch", credential.branch],
    ["Institution", credential.institution],
    ["Graduation Year", String(credential.graduationYear)],
    ["CGPA", credential.cgpa === null ? "Not provided" : String(credential.cgpa)],
    ["Issue Date", credential.issueDate.toLocaleDateString()],
    ["Status", credential.status],
  ];

  fields.forEach(([label, value]) => {
    document.fontSize(9).fillColor("#6b7280").text(label.toUpperCase());
    document.fontSize(12).fillColor("#111827").text(value);
    document.moveDown(0.65);
  });

  document.moveDown(1);
  document.fontSize(9).fillColor("#6b7280").text("CREDENTIAL HASH");
  document.fontSize(8).fillColor("#111827").text(credential.credentialHash, { width: 480 });
  document.moveDown(0.8);
  document.fontSize(9).fillColor("#6b7280").text("LEDGER BLOCK");
  document.fontSize(11).fillColor("#111827").text(`#${credential.ledgerBlock?.blockIndex ?? "N/A"}`);
  document.moveDown(2);
  document.fontSize(9).fillColor("#6b7280").text(`Issuer: ${credential.issuer.name} (${credential.issuer.code})`);
  document.text("Verify this credential through the public QR verification portal.");
  document.end();

  const pdf = await finished;
  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${credential.credentialId}.pdf"`,
      "Content-Length": String(pdf.length),
    },
  });
}