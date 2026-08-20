"use client";

import { useEffect, useState } from "react";

interface QRCodeDisplayProps {
  credentialId: string;
}

interface QRResponse {
  success: boolean;
  qr?: string;
  verificationUrl?: string;
  error?: string;
}

export default function QRCodeDisplay({
  credentialId,
}: QRCodeDisplayProps) {
  const [qr, setQr] = useState<string | null>(
    null
  );

  const [verificationUrl, setVerificationUrl] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadQR() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/credentials/${encodeURIComponent(
            credentialId
          )}/qr`
        );

        const data: QRResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Unable to generate QR."
          );
        }

        setQr(data.qr || null);
        setVerificationUrl(
          data.verificationUrl || null
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate QR."
        );
      } finally {
        setLoading(false);
      }
    }

    loadQR();
  }, [credentialId]);

  if (loading) {
    return (
      <div className="flex h-64 w-64 items-center justify-center rounded-xl border bg-white">
        <p className="text-sm text-gray-500">
          Generating QR...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!qr) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <img
          src={qr}
          alt={`Verification QR for ${credentialId}`}
          className="h-64 w-64"
        />
      </div>

      <div className="max-w-md text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Credential ID
        </p>

        <p className="mt-1 font-mono text-sm">
          {credentialId}
        </p>

        {verificationUrl && (
          <p className="mt-3 break-all text-xs text-gray-500">
            {verificationUrl}
          </p>
        )}
      </div>
    </div>
  );
}