import CredentialDetails from "@/components/CredentialDetails";

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

export default async function CredentialDetailsPage({
  params,
}: PageProps) {
  const { credentialId } =
    await params;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <a
            href="/dashboard/credentials"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Credentials
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <CredentialDetails
          credentialId={credentialId}
        />
      </div>
    </main>
  );
}