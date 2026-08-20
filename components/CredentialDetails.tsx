"use client";

import { useEffect, useState } from "react";
import QRCodeDisplay from "./QRCodeDisplay";
import VerificationBadge from "./VerificationBadge";

interface Credential {
  credentialId: string;
  studentName: string;
  studentId: string;
  degree: string;
  branch: string;
  institution: string;
  graduationYear: number;
  cgpa: number | null;
  issueDate: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  credentialHash: string;
  digitalSignature: string;
  revokedAt: string | null;
  revocationReason: string | null;

  issuer: {
    name: string;
    code: string;
    publicKey: string;
  };

  ledgerBlock: {
    blockIndex: number;
    dataHash: string;
    previousHash: string;
    currentHash: string;
    timestamp: string;
  } | null;
}

export default function CredentialDetails({
  credentialId,
}: {
  credentialId: string;
}) {
  const [credential, setCredential] =
    useState<Credential | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [reason, setReason] =
    useState("");

  const [revoking, setRevoking] =
    useState(false);

  async function loadCredential() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/credentials/${encodeURIComponent(
          credentialId
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Credential not found."
        );
      }

      setCredential(data.credential);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load credential."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCredential();
  }, [credentialId]);

  async function revoke() {
    if (!reason.trim()) {
      setError(
        "Please provide a revocation reason."
      );
      return;
    }

    try {
      setRevoking(true);
      setError(null);

      const response = await fetch(
        `/api/credentials/${encodeURIComponent(
          credentialId
        )}/revoke`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to revoke credential."
        );
      }

      setReason("");
      await loadCredential();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to revoke credential."
      );
    } finally {
      setRevoking(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
        Loading credential...
      </div>
    );
  }

  if (error && !credential) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        {error}
      </div>
    );
  }

  if (!credential) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Credential Details
          </p>

          <h1 className="mt-2 break-all font-mono text-2xl font-bold">
            {credential.credentialId}
          </h1>
        </div>

        <VerificationBadge
          status={
            credential.status === "ACTIVE"
              ? "VALID"
              : credential.status === "REVOKED"
                ? "REVOKED"
                : "NOT_FOUND"
          }
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="rounded-2xl border bg-white p-7 shadow-sm">
            <h2 className="text-lg font-semibold">
              Credential Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Detail
                label="Student Name"
                value={
                  credential.studentName
                }
              />

              <Detail
                label="Student ID"
                value={
                  credential.studentId
                }
              />

              <Detail
                label="Degree"
                value={credential.degree}
              />

              <Detail
                label="Branch"
                value={credential.branch}
              />

              <Detail
                label="Institution"
                value={
                  credential.institution
                }
              />

              <Detail
                label="Graduation Year"
                value={String(
                  credential.graduationYear
                )}
              />

              <Detail
                label="CGPA"
                value={
                  credential.cgpa !== null
                    ? String(
                        credential.cgpa
                      )
                    : "Not provided"
                }
              />

              <Detail
                label="Issue Date"
                value={new Date(
                  credential.issueDate
                ).toLocaleString()}
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-7 shadow-sm">
            <h2 className="text-lg font-semibold">
              Cryptographic Identity
            </h2>

            <div className="mt-6 space-y-5">
              <HashValue
                label="Credential SHA-256 Hash"
                value={
                  credential.credentialHash
                }
              />

              <HashValue
                label="Ed25519 Digital Signature"
                value={
                  credential.digitalSignature
                }
              />

              <HashValue
                label="Issuer Public Key"
                value={
                  credential.issuer.publicKey
                }
              />
            </div>
          </section>

          {credential.ledgerBlock && (
            <section className="rounded-2xl border bg-white p-7 shadow-sm">
              <h2 className="text-lg font-semibold">
                Ledger Record
              </h2>

              <div className="mt-6 space-y-5">
                <Detail
                  label="Block Index"
                  value={String(
                    credential.ledgerBlock
                      .blockIndex
                  )}
                />

                <HashValue
                  label="Data Hash"
                  value={
                    credential.ledgerBlock
                      .dataHash
                  }
                />

                <HashValue
                  label="Previous Block Hash"
                  value={
                    credential.ledgerBlock
                      .previousHash
                  }
                />

                <HashValue
                  label="Current Block Hash"
                  value={
                    credential.ledgerBlock
                      .currentHash
                  }
                />
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Verification QR
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Anyone can scan this QR to verify the
              credential.
            </p>

            <div className="mt-6">
              <QRCodeDisplay
                credentialId={
                  credential.credentialId
                }
              />
            </div>
          </section>

          {credential.status === "ACTIVE" && (
            <section className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
              <h2 className="font-semibold text-orange-900">
                Revoke Credential
              </h2>

              <p className="mt-2 text-sm text-orange-800">
                Revocation does not modify the original
                ledger record. It records the credential
                as revoked.
              </p>

              <textarea
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value
                  )
                }
                placeholder="Enter reason for revocation..."
                rows={4}
                className="mt-4 w-full rounded-lg border border-orange-200 bg-white p-3 text-sm outline-none focus:border-orange-500"
              />

              <button
                type="button"
                onClick={revoke}
                disabled={revoking}
                className="mt-4 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {revoking
                  ? "Revoking..."
                  : "Revoke Credential"}
              </button>
            </section>
          )}

          {credential.status ===
            "REVOKED" && (
            <section className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
              <h2 className="font-semibold text-orange-900">
                Credential Revoked
              </h2>

              {credential.revokedAt && (
                <p className="mt-3 text-sm text-orange-800">
                  Revoked on{" "}
                  {new Date(
                    credential.revokedAt
                  ).toLocaleString()}
                </p>
              )}

              {credential.revocationReason && (
                <div className="mt-4 rounded-lg bg-white p-4 text-sm text-gray-700">
                  <strong>Reason:</strong>{" "}
                  {
                    credential.revocationReason
                  }
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}

function HashValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <div className="mt-2 break-all rounded-lg bg-gray-50 p-3 font-mono text-xs leading-5 text-gray-700">
        {value}
      </div>
    </div>
  );
}