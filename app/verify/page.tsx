"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifySearchPage() {
  const [credentialId, setCredentialId] =
    useState("");

  const router = useRouter();

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmed =
      credentialId.trim();

    if (!trimmed) {
      return;
    }

    router.push(
      `/verify/${encodeURIComponent(
        trimmed
      )}`
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Public Verification
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Verify an Academic Credential
          </h1>

          <p className="mt-4 text-gray-600">
            Enter the credential ID printed on the
            credential or available through its QR code.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border bg-white p-8 shadow-sm"
        >
          <label className="block text-sm font-medium text-gray-800">
            Credential ID
          </label>

          <input
            value={credentialId}
            onChange={(event) =>
              setCredentialId(
                event.target.value
              )
            }
            placeholder="e.g. CRD-2026-XXXXXXXXXXXX"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Verify Credential
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Verification checks the credential hash,
          issuer signature, ledger integrity and
          revocation status.
        </p>
      </div>
    </main>
  );
}