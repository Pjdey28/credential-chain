import QRCode from "qrcode";

export function buildVerificationUrl(
  credentialId: string
): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return `${baseUrl}/verify/${encodeURIComponent(
    credentialId
  )}`;
}

export async function generateCredentialQR(
  credentialId: string
): Promise<string> {
  const verificationUrl =
    buildVerificationUrl(credentialId);

  return QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 500,
  });
}