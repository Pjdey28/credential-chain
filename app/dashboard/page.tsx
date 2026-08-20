import CredentialIssuer from "@/components/CredentialIssuer";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              CredentialChain
            </p>

            <h1 className="mt-1 text-xl font-bold">
              Institution Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.issuer?.name}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Issue Academic Credential
          </h2>

          <p className="mt-2 max-w-2xl text-gray-600">
            Create a digitally signed academic credential
            and record its integrity proof in the
            institutional ledger.
          </p>
        </div>

        <CredentialIssuer />
      </div>
    </main>
  );
}