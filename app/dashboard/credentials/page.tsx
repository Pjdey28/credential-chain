import CredentialTable from "@/components/CredentialTable";

export default function CredentialsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              CredentialChain
            </p>

            <h1 className="mt-1 text-xl font-bold">
              Credential Management
            </h1>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Issue Credential
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Issued Credentials
          </h2>

          <p className="mt-2 text-gray-600">
            Manage credentials issued by the institution
            and monitor their verification status.
          </p>
        </div>

        <CredentialTable />
      </div>
    </main>
  );
}