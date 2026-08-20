import BulkCredentialIssuer from "@/components/BulkCredentialIssuer";

export default function BulkPage() {
  return <main className="min-h-screen bg-gray-50"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><h1 className="text-xl font-bold">Bulk Credential Issuance</h1><a href="/dashboard" className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Back to dashboard</a></div></header><div className="mx-auto max-w-4xl px-6 py-10"><BulkCredentialIssuer /></div></main>;
}