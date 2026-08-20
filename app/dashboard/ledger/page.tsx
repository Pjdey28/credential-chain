import LedgerExplorer from "@/components/LedgerExplorer";

export default function LedgerPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">CredentialChain</p>
            <h1 className="mt-1 text-xl font-bold">Blockchain Ledger</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Back to dashboard</a>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <LedgerExplorer />
      </div>
    </main>
  );
}