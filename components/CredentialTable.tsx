"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  issuer: {
    name: string;
    code: string;
  };

  ledgerBlock: {
    blockIndex: number;
    currentHash: string;
    previousHash: string;
  } | null;
}

type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "REVOKED"
  | "EXPIRED";

export default function CredentialTable() {
  const [credentials, setCredentials] =
    useState<Credential[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<StatusFilter>("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadCredentials() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/credentials?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to load credentials."
        );
      }

      setCredentials(
        data.credentials
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCredentials();
  }, [status]);

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();
    loadCredentials();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-4 md:flex-row"
        >
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by student name, ID or credential ID"
            className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as StatusFilter
              )
            }
            className="rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="REVOKED">
              Revoked
            </option>

            <option value="EXPIRED">
              Expired
            </option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading credentials...
          </div>
        ) : credentials.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">
              No credentials found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Credential
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Student
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Program
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Ledger
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4" />
                </tr>
              </thead>

              <tbody className="divide-y">
                {credentials.map(
                  (credential) => (
                    <tr
                      key={
                        credential.credentialId
                      }
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <Link
                          href={`/dashboard/credentials/${encodeURIComponent(
                            credential.credentialId
                          )}`}
                          className="font-mono text-xs font-semibold text-blue-600 hover:underline"
                        >
                          {
                            credential.credentialId
                          }
                        </Link>

                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(
                            credential.issueDate
                          ).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium">
                          {
                            credential.studentName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            credential.studentId
                          }
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p>
                          {credential.degree}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {credential.branch}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        {credential.ledgerBlock ? (
                          <>
                            <p className="font-medium">
                              Block #
                              {
                                credential
                                  .ledgerBlock
                                  .blockIndex
                              }
                            </p>

                            <p className="mt-1 font-mono text-xs text-gray-500">
                              {
                                credential
                                  .ledgerBlock
                                  .currentHash
                                  .slice(
                                    0,
                                    12
                                  )
                              }
                              ...
                            </p>
                          </>
                        ) : (
                          <span className="text-gray-400">
                            No block
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          status={
                            credential.status
                          }
                        />
                      </td>

                      <td className="px-6 py-5">
                        <Link
                          href={`/dashboard/credentials/${encodeURIComponent(
                            credential.credentialId
                          )}`}
                          className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Showing {credentials.length} credential
        {credentials.length === 1
          ? ""
          : "s"}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Credential["status"];
}) {
  const styles = {
    ACTIVE:
      "bg-green-100 text-green-700",
    REVOKED:
      "bg-orange-100 text-orange-700",
    EXPIRED:
      "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}