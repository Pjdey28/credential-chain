"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} disabled={loading} className="rounded-lg border px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}