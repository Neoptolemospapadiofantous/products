'use client';

import { useState } from 'react';
import type { StageName, StageRecord, StageStatus } from '@/lib/types';
import { STAGE_LABELS } from '@/lib/types';

const statusColor: Record<StageStatus, string> = {
  pending: 'bg-neutral-100 text-neutral-600',
  running: 'bg-amber-100 text-amber-800',
  done: 'bg-emerald-100 text-emerald-800',
  error: 'bg-rose-100 text-rose-800',
};

type Props = {
  slug: string;
  stage: StageName;
  record?: StageRecord;
  children: React.ReactNode;
  rerunnable?: boolean;
};

export function StageCard({ slug, stage, record, children, rerunnable = true }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const status = record?.status ?? 'pending';

  async function run() {
    const secret = window.prompt('CRON_SECRET');
    if (!secret) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/pipeline/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret },
        body: JSON.stringify({ slug, stage }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'failed');
      window.location.reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white">
      <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
            {STAGE_LABELS[stage]}
          </h2>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[status]}`}>
            {busy ? 'running…' : status}
          </span>
        </div>
        {rerunnable && (
          <button
            onClick={run}
            disabled={busy}
            className="rounded border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
          >
            {record?.status === 'done' ? 'Re-run' : 'Run'}
          </button>
        )}
      </header>
      <div className="px-5 py-4 text-sm">
        {err && <div className="mb-3 rounded bg-rose-50 p-2 text-xs text-rose-700">{err}</div>}
        {record?.status === 'error' && (
          <div className="mb-3 rounded bg-rose-50 p-2 text-xs text-rose-700">{record.error}</div>
        )}
        {children}
      </div>
    </section>
  );
}
