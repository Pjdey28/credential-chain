import VerificationResult from "../../../components/VerificationResult";

interface VerifyPageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

async function getVerification(
  credentialId: string
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/credentials/${encodeURIComponent(
      credentialId
    )}/verify`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  return data.verification;
}

export default async function VerifyPage({
  params,
}: VerifyPageProps) {
  const { credentialId } = await params;

  const verification =
    await getVerification(
      credentialId
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            CredentialChain
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Academic Credential Verification
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Independently verify the authenticity and
            integrity of an academic credential.
          </p>

          <p className="mt-4 font-mono text-xs text-gray-500">
            {credentialId}
          </p>
        </div>

        <VerificationResult
          verification={verification}
        />

        <div className="mt-10 text-center text-xs text-gray-400">
          Verification powered by cryptographic
          signatures and an immutable hash-chain
          ledger.
        </div>
      </div>
    </main>
  );
}