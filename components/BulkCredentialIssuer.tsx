"use client";

import { ChangeEvent, useState } from "react";

interface BulkResult {
  summary: { total: number; issued: number; failed: number };
  issued: { row: number; credentialId: string }[];
  errors: { row: number; error: string }[];
}

export default function BulkCredentialIssuer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const body = new FormData();
    body.set("file", file);

    try {
      const response = await fetch("/api/credentials/bulk", { method: "POST", body });
      const data = await response.json();
      if (!response.ok && !data.summary) throw new Error(data.error || "Bulk issuance failed.");
      setResult(data);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Bulk issuance failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-7 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Batch workflow</p>
      <h2 className="mt-2 text-2xl font-bold">Bulk Credential Issuance</h2>
      <p className="mt-2 text-sm text-gray-600">Upload up to 100 CSV rows. Each valid row goes through the same signing and ledger transaction as single issuance.</p>
      <p className="mt-5 rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-600">studentName,studentId,degree,branch,institution,graduationYear,cgpa</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="file" accept=".csv,text/csv" onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] || null)} className="block w-full rounded-lg border px-3 py-2 text-sm" />
        <button onClick={submit} disabled={!file || loading} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{loading ? "Issuing..." : "Issue CSV"}</button>
      </div>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {result && <div className="mt-5 space-y-3"><p className="text-sm font-semibold">Processed {result.summary.total}: {result.summary.issued} issued, {result.summary.failed} failed.</p>{result.errors.map((item) => <p key={item.row} className="text-sm text-red-700">Row {item.row}: {item.error}</p>)}</div>}
    </section>
  );
}