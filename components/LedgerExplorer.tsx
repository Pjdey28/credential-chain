"use client";

import { useEffect, useState } from "react";

interface LedgerBlock {
  blockIndex: number;
  credentialId: string | null;
  dataHash: string;
  previousHash: string;
  currentHash: string;
  timestamp: string;
  credential: {
    studentName: string;
    degree: string;
    status: string;
  } | null;
}

interface TamperResult {
  original: {
    field: string;
    value: string | number | null;
    credentialHash: string;
    signatureValid: boolean;
  };
  tampered: {
    field: string;
    value: string | number | null;
    credentialHash: string;
    hashChanged: boolean;
    signatureValid: boolean;
    ledgerDataHashMatches: boolean;
    ledgerBlockValid: boolean;
  };
  persisted: boolean;
}

export default function LedgerExplorer() {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [tamperField, setTamperField] = useState("studentName");
  const [tamperValue, setTamperValue] = useState("");
  const [tamper, setTamper] = useState<TamperResult | null>(null);
  const [ledgerValid, setLedgerValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLedger() {
      try {
        const response = await fetch("/api/ledger", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load ledger.");
        }

        setBlocks(data.blocks);
        setSelectedId(data.blocks[0]?.credentialId || "");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load ledger.");
      } finally {
        setLoading(false);
      }
    }

    loadLedger();
  }, []);

  async function verifyLedger() {
    const response = await fetch("/api/ledger/verify", { cache: "no-store" });
    const data = await response.json();
    setLedgerValid(data.success ? data.ledger.valid : false);
  }

  async function runTamperDemo() {
    if (!selectedId || !tamperValue.trim()) {
      setError("Choose a field and enter the changed value first.");
      return;
    }

    setRunning(true);
    setTamper(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/credentials/${encodeURIComponent(selectedId)}/tamper-demo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: tamperField, value: tamperValue }),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to run tamper demonstration.");
      }

      setTamper(data);
    } catch (demoError) {
      setError(demoError instanceof Error ? demoError.message : "Unable to run tamper demonstration.");
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl border bg-white p-8 text-gray-500">Loading ledger...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Integrity Monitor</p>
            <h2 className="mt-2 text-2xl font-bold">Ledger Explorer</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Each block commits a credential hash and the previous block hash. A changed field cannot preserve the original signature.
            </p>
          </div>
          <button onClick={verifyLedger} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50">
            Verify entire chain
          </button>
        </div>

        {ledgerValid !== null && (
          <div className={`mt-5 rounded-xl border p-4 text-sm font-semibold ${ledgerValid ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
            {ledgerValid ? "VALID: every block links to the next." : "FAIL: the ledger chain contains an invalid block."}
          </div>
        )}
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {blocks.map((block) => (
          <button
            key={block.blockIndex}
            onClick={() => setSelectedId(block.credentialId || "")}
            className={`text-left rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedId === block.credentialId ? "border-blue-500 ring-2 ring-blue-100" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-bold">Block #{block.blockIndex}</span>
              <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold uppercase text-green-700">valid</span>
            </div>
            <p className="mt-4 truncate text-sm font-semibold">{block.credential?.studentName || "Unlinked block"}</p>
            <p className="mt-1 truncate text-xs text-gray-500">{block.credentialId || "No credential"}</p>
            <Hash label="Data hash" value={block.dataHash} />
            <Hash label="Previous hash" value={block.previousHash} />
            <Hash label="Current hash" value={block.currentHash} />
          </button>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Controlled demonstration</p>
            <h2 className="mt-2 text-xl font-bold text-amber-950">Tamper a credential in memory</h2>
            <p className="mt-2 max-w-2xl text-sm text-amber-900/80">
              Select a signed field, enter a replacement value, and verify the edited payload. The database and issued credential remain untouched.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-80">
            <select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setTamper(null); }} className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm">
              {blocks.filter((block) => block.credentialId).map((block) => <option key={block.credentialId} value={block.credentialId || ""}>{block.credentialId} · {block.credential?.studentName}</option>)}
            </select>
            <select value={tamperField} onChange={(event) => { setTamperField(event.target.value); setTamper(null); }} className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm">
              <option value="studentName">Student name</option>
              <option value="studentId">Student ID</option>
              <option value="degree">Degree</option>
              <option value="branch">Branch</option>
              <option value="institution">Institution</option>
              <option value="graduationYear">Graduation year</option>
              <option value="cgpa">CGPA</option>
            </select>
            <input value={tamperValue} onChange={(event) => { setTamperValue(event.target.value); setTamper(null); }} placeholder="Enter replacement value" className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm" />
            <button onClick={runTamperDemo} disabled={running || !selectedId || !tamperValue.trim()} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
              {running ? "Running demonstration..." : "Change one field and verify"}
            </button>
          </div>
        </div>

        {tamper && <TamperReport result={tamper} />}
      </section>
    </div>
  );
}

function Hash({ label, value }: { label: string; value: string }) {
  return <div className="mt-4"><p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 break-all font-mono text-[10px] leading-4 text-gray-700">{value}</p></div>;
}

function TamperReport({ result }: { result: TamperResult }) {
  return (
    <div className="mt-6 rounded-xl border border-amber-300 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-gray-950">Verification result after editing {result.tampered.field}</h3>
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">FAIL · tampering detected</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-bold uppercase text-green-700">Original credential · PASS</p>
          <p className="mt-2 text-sm font-semibold">Original: {String(result.original.value)}</p>
          <Hash label="Stored hash" value={result.original.credentialHash} />
          <Check label="Digital signature" passed={result.original.signatureValid} />
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-bold uppercase text-red-700">Altered payload · FAIL</p>
          <p className="mt-2 text-sm font-semibold">Edited: {String(result.tampered.value)}</p>
          <Hash label="New hash" value={result.tampered.credentialHash} />
          <Check label="Hash changed" passed={result.tampered.hashChanged} inverted />
          <Check label="Original signature still valid" passed={result.tampered.signatureValid} />
          <Check label="Ledger data hash matches" passed={result.tampered.ledgerDataHashMatches} />
          <Check label="Ledger block remains valid" passed={result.tampered.ledgerBlockValid} />
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold text-gray-500">Persisted to database: {result.persisted ? "Yes" : "No, this is a safe simulation."}</p>
    </div>
  );
}

function Check({ label, passed, inverted = false }: { label: string; passed: boolean; inverted?: boolean }) {
  const success = inverted ? passed : passed;
  return <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2 text-xs"><span>{label}</span><strong className={success ? "text-green-700" : "text-red-700"}>{success ? "PASS" : "FAIL"}</strong></div>;
}