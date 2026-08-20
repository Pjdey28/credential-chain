"use client";

import { FormEvent, useState } from "react";

import QRCodeDisplay from "./QRCodeDisplay";

interface IssuedCredential {
  credentialId: string;
  studentName: string;
  degree: string;
  branch: string;
  institution: string;
  issueDate: string;
  status: string;
}

export default function CredentialIssuer() {
  const [form, setForm] = useState({
    studentName: "",
    studentId: "",
    degree: "B.Tech",
    branch: "",
    institution:
      "National Institute of Technology Rourkela",
    graduationYear: new Date().getFullYear(),
    cgpa: "",
  });

  const [credential, setCredential] =
    useState<IssuedCredential | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  function updateField(
    field: string,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setCredential(null);

    try {
      const response = await fetch(
        "/api/credentials",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentName: form.studentName,
            studentId: form.studentId,
            degree: form.degree,
            branch: form.branch,
            institution: form.institution,
            graduationYear:
              Number(form.graduationYear),
            cgpa:
              form.cgpa === ""
                ? undefined
                : Number(form.cgpa),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to issue credential."
        );
      }

      setCredential(data.credential);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to issue credential."
      );
    } finally {
      setLoading(false);
    }
  }

  if (credential) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-600">
                Successfully Issued
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Academic Credential
              </h2>
            </div>

            <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {credential.status}
            </div>
          </div>

          <div className="space-y-5">
            <Detail
              label="Credential ID"
              value={credential.credentialId}
              mono
            />

            <Detail
              label="Student"
              value={credential.studentName}
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
              value={credential.institution}
            />

            <Detail
              label="Issue Date"
              value={new Date(
                credential.issueDate
              ).toLocaleString()}
            />
          </div>

          <div className="mt-8 rounded-xl bg-blue-50 p-5">
            <p className="text-sm font-semibold text-blue-900">
              Credential successfully recorded.
            </p>

            <p className="mt-1 text-sm text-blue-700">
              The credential has been hashed, digitally
              signed and linked to the institutional
              integrity ledger.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCredential(null);
              setForm({
                studentName: "",
                studentId: "",
                degree: "B.Tech",
                branch: "",
                institution:
                  "National Institute of Technology Rourkela",
                graduationYear:
                  new Date().getFullYear(),
                cgpa: "",
              });
            }}
            className="mt-8 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Issue Another Credential
          </button>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold">
              Verification QR
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Scan this QR code to independently verify
              the credential.
            </p>
          </div>

          <QRCodeDisplay
            credentialId={
              credential.credentialId
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-white p-8 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Student Name"
            required
            value={form.studentName}
            onChange={(value) =>
              updateField(
                "studentName",
                value
              )
            }
            placeholder="Enter full name"
          />

          <Field
            label="Student ID"
            required
            value={form.studentId}
            onChange={(value) =>
              updateField(
                "studentId",
                value
              )
            }
            placeholder="e.g. CH22B001"
          />

          <Field
            label="Degree"
            required
            value={form.degree}
            onChange={(value) =>
              updateField(
                "degree",
                value
              )
            }
            placeholder="B.Tech"
          />

          <Field
            label="Branch"
            required
            value={form.branch}
            onChange={(value) =>
              updateField(
                "branch",
                value
              )
            }
            placeholder="Chemical Engineering"
          />

          <div className="md:col-span-2">
            <Field
              label="Institution"
              required
              value={form.institution}
              onChange={(value) =>
                updateField(
                  "institution",
                  value
                )
              }
              placeholder="Institution name"
            />
          </div>

          <Field
            label="Graduation Year"
            required
            type="number"
            value={form.graduationYear}
            onChange={(value) =>
              updateField(
                "graduationYear",
                Number(value)
              )
            }
            placeholder="2026"
          />

          <Field
            label="CGPA"
            type="number"
            value={form.cgpa}
            onChange={(value) =>
              updateField(
                "cgpa",
                value
              )
            }
            placeholder="e.g. 8.72"
          />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 border-t pt-6">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Issuing Credential..."
              : "Issue Credential"}
          </button>

          <p className="mt-3 text-xs text-gray-500">
            Issuing this credential will generate a
            cryptographic hash, digital signature and
            immutable ledger record.
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-800">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-medium text-gray-900 ${
          mono ? "break-all font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}