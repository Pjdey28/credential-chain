"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Institution {
  id: string;
  name: string;
  code: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/institutions")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.success) setInstitutions(data.institutions);
      })
      .catch(() => setError("Unable to load institutions."));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", name, email, password, institutionId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.error || "Signup failed.");
      router.push("/dashboard");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Signup failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">CredentialChain</p>
          <h1 className="mt-3 text-3xl font-bold">Register Institution Account</h1>
          <p className="mt-2 text-sm text-gray-600">Create an authorized account for credential management.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-8 shadow-sm">
          <label className="text-sm font-medium">
            Administrator Name
            <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500" />
          </label>
          <label className="mt-5 block text-sm font-medium">
            Institution
            <select required value={institutionId} onChange={(event) => setInstitutionId(event.target.value)} className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">
              <option value="">Select institution</option>
              {institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name} ({institution.code})</option>)}
            </select>
          </label>
          <label className="mt-5 block text-sm font-medium">
            Email
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500" />
          </label>
          <label className="mt-5 block text-sm font-medium">
            Password
            <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500" />
          </label>

          {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading || !institutionId} className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Institution Account"}
          </button>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already registered? <Link href="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}