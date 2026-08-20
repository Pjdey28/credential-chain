"use client";

import { FormEvent, useState } from "react";

interface WalletCredential {
  credentialId: string;
  degree: string;
  branch: string;
  institution: string;
  issueDate: string;
  issuer: { name: string; code: string };
  verification: { valid: boolean; status: string };
}

export default function WalletPage() {
  const [studentId, setStudentId] = useState("");
  const [credentials, setCredentials] = useState<WalletCredential[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function search(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch(`/api/wallet/${encodeURIComponent(studentId.trim())}`, { cache: "no-store" });
    const data = await response.json();
    setCredentials(data.success ? data.credentials : []);
    setSearched(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">CredentialChain Wallet</p><h1 className="mt-3 text-4xl font-bold">Student Credentials</h1><p className="mt-3 text-gray-600">Retrieve verifiable credentials using the student ID.</p></div>
        <form onSubmit={search} className="mx-auto mt-8 flex max-w-xl gap-3 rounded-2xl border bg-white p-4 shadow-sm"><input required value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="Enter student ID" className="min-w-0 flex-1 rounded-lg border px-4 py-3 text-sm" /><button disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Searching..." : "Open wallet"}</button></form>
        {searched && credentials.length === 0 && <p className="mt-8 text-center text-sm text-gray-500">No credentials found for this student ID.</p>}
        <div className="mt-8 space-y-4">{credentials.map((credential) => <article key={credential.credentialId} className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{credential.degree}</h2><p className="mt-1 text-sm text-gray-600">{credential.branch} · {credential.institution}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${credential.verification.valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{credential.verification.status}</span></div><div className="mt-5 grid gap-3 text-sm sm:grid-cols-3"><p><span className="text-gray-500">Credential</span><br /><a className="font-mono text-blue-600 hover:underline" href={`/verify/${credential.credentialId}`}>{credential.credentialId}</a></p><p><span className="text-gray-500">Issued</span><br />{new Date(credential.issueDate).toLocaleDateString()}</p><p><span className="text-gray-500">Issuer</span><br />{credential.issuer.name}</p></div></article>)}</div>
      </div>
    </main>
  );
}