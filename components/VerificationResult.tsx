interface VerificationResultProps {
  verification: {
    valid: boolean;
    status:
      | "VALID"
      | "REVOKED"
      | "TAMPERED"
      | "NOT_FOUND";

    credentialId?: string;

    checks: {
      credentialExists: boolean;
      hashValid: boolean;
      signatureValid: boolean;
      ledgerValid: boolean;
      issuerValid: boolean;
      revoked: boolean;
    };

    credential?: {
      studentName: string;
      studentId: string;
      degree: string;
      branch: string;
      institution: string;
      graduationYear: number;
      cgpa: number | null;
      issueDate: string;
      status: string;
    };

    reason?: string;
    fraudSignals?: {
      hashMismatch: boolean;
      signatureFailure: boolean;
      ledgerMismatch: boolean;
      revokedCredential: boolean;
      unknownIssuer: boolean;
      abnormalRepeatedVerification: boolean;
      recentVerificationCount: number;
    };
  };
}

function CheckRow({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b py-3 last:border-b-0">
      <span className="text-sm text-gray-700">
        {label}
      </span>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          passed
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {passed ? "PASS" : "FAIL"}
      </span>
    </div>
  );
}

export default function VerificationResult({
  verification,
}: VerificationResultProps) {
  const {
    valid,
    status,
    credential,
    checks,
    reason,
    fraudSignals,
  } = verification;

  const statusConfig = {
    VALID: {
      title: "Credential Verified",
      description:
        "This credential passed all authenticity checks.",
      className:
        "border-green-200 bg-green-50 text-green-800",
    },

    REVOKED: {
      title: "Credential Revoked",
      description:
        "This credential was previously issued but has been revoked by the issuer.",
      className:
        "border-orange-200 bg-orange-50 text-orange-800",
    },

    TAMPERED: {
      title: "Credential Integrity Failed",
      description:
        "One or more cryptographic checks failed. The credential may have been modified.",
      className:
        "border-red-200 bg-red-50 text-red-800",
    },

    NOT_FOUND: {
      title: "Credential Not Found",
      description:
        "No credential matching this identifier exists.",
      className:
        "border-red-200 bg-red-50 text-red-800",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="space-y-6">
      <div
        className={`rounded-2xl border p-6 ${config.className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">
              Verification Status
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {config.title}
            </h2>

            <p className="mt-2 text-sm opacity-90">
              {config.description}
            </p>
          </div>

          <div className="text-3xl">
            {valid
              ? "✓"
              : status === "REVOKED"
                ? "!"
                : "×"}
          </div>
        </div>
      </div>

      {fraudSignals && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Fraud Signals</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Signal label="Hash mismatch" active={fraudSignals.hashMismatch} />
            <Signal label="Signature failure" active={fraudSignals.signatureFailure} />
            <Signal label="Ledger mismatch" active={fraudSignals.ledgerMismatch} />
            <Signal label="Revoked credential" active={fraudSignals.revokedCredential} />
            <Signal label="Unknown issuer" active={fraudSignals.unknownIssuer} />
            <Signal label="Repeated verification activity" active={fraudSignals.abnormalRepeatedVerification} />
          </div>
          <p className="mt-4 text-xs text-gray-500">Verification requests in the last 24 hours: {fraudSignals.recentVerificationCount}</p>
        </div>
      )}

      {credential && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">
            Credential Details
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Student Name
              </p>
              <p className="mt-1 font-medium">
                {credential.studentName}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Student ID
              </p>
              <p className="mt-1 font-medium">
                {credential.studentId}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Degree
              </p>
              <p className="mt-1 font-medium">
                {credential.degree}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Branch
              </p>
              <p className="mt-1 font-medium">
                {credential.branch}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Institution
              </p>
              <p className="mt-1 font-medium">
                {credential.institution}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Graduation Year
              </p>
              <p className="mt-1 font-medium">
                {credential.graduationYear}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                CGPA
              </p>
              <p className="mt-1 font-medium">
                {credential.cgpa ?? "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Issued
              </p>
              <p className="mt-1 font-medium">
                {new Date(
                  credential.issueDate
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">
          Cryptographic Verification
        </h3>

        <div className="mt-4">
          <CheckRow
            label="Credential exists"
            passed={checks.credentialExists}
          />

          <CheckRow
            label="Credential hash matches"
            passed={checks.hashValid}
          />

          <CheckRow
            label="Issuer digital signature"
            passed={checks.signatureValid}
          />

          <CheckRow
            label="Ledger block integrity"
            passed={checks.ledgerValid}
          />

          <CheckRow
            label="Issuer identity"
            passed={checks.issuerValid}
          />

          <CheckRow
            label="Credential not revoked"
            passed={!checks.revoked}
          />
        </div>
      </div>

      {reason && (
        <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          <strong>Verification message:</strong>{" "}
          {reason}
        </div>
      )}
    </div>
  );
}

function Signal({ label, active }: { label: string; active: boolean }) {
  return <div className={`rounded-lg border p-3 text-sm ${active ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}><span className="font-semibold">{active ? "FLAG" : "CLEAR"}</span><span className="ml-2">{label}</span></div>;
}