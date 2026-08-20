import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              CredentialChain
            </p>

            <h1 className="mt-5 text-5xl font-bold tracking-tight text-gray-950">
              Tamper-Proof Academic
              <br />
              Credential Verification
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Issue digitally signed academic credentials
              and allow employers, universities and
              verification authorities to independently
              verify their authenticity.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Institution Dashboard
              </Link>

              <Link
                href="/verify"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
              >
                Verify Credential
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            title="Digital Signatures"
            description="Credentials are signed using the institution's Ed25519 signing identity."
          />

          <Feature
            title="Hash-Chain Integrity"
            description="Credential records are linked through SHA-256 hashes so unauthorized modification can be detected."
          />

          <Feature
            title="Instant Verification"
            description="A QR code gives verifiers direct access to the public verification portal."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-7 shadow-sm">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        {description}
      </p>
    </div>
  );
}