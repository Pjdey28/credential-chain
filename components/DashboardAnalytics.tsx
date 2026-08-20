"use client";

import { useEffect, useState } from "react";

interface Analytics {
  totalCredentials: number;
  activeCredentials: number;
  revokedCredentials: number;
  verificationActivity: number;
  ledgerBlocks: number;
}

interface AuditEvent {
  id: string;
  credentialId: string | null;
  eventType: string;
  description: string;
  createdAt: string;
}

export default function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/audit", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([analyticsData, auditData]) => {
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
      if (auditData.success) setEvents(auditData.events);
    });
  }, []);

  if (!analytics) {
    return <div className="rounded-2xl border bg-white p-6 text-sm text-gray-500">Loading institution analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Institution Overview</p>
          <h2 className="mt-1 text-xl font-bold">Credential activity</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Total credentials" value={analytics.totalCredentials} />
          <Metric label="Active" value={analytics.activeCredentials} tone="green" />
          <Metric label="Revoked" value={analytics.revokedCredentials} tone="orange" />
          <Metric label="Verifications" value={analytics.verificationActivity} tone="blue" />
          <Metric label="Ledger blocks" value={analytics.ledgerBlocks} tone="purple" />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Audit Trail</p>
            <h2 className="mt-1 text-xl font-bold">Recent activity</h2>
          </div>
          <span className="text-xs text-gray-500">Last 100 events</span>
        </div>
        <div className="mt-5 divide-y">
          {events.length === 0 ? (
            <p className="py-5 text-sm text-gray-500">No audit events recorded yet.</p>
          ) : events.slice(0, 8).map((event) => (
            <div key={event.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{event.description}</p>
                <p className="mt-1 font-mono text-xs text-gray-500">{event.credentialId || "system"}</p>
              </div>
              <time className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</time>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, tone = "gray" }: { label: string; value: number; tone?: string }) {
  const colors: Record<string, string> = {
    gray: "bg-white",
    green: "bg-green-50",
    orange: "bg-orange-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
  };

  return <div className={`rounded-xl border p-5 ${colors[tone] || colors.gray}`}><p className="text-xs font-semibold text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold text-gray-950">{value}</p></div>;
}