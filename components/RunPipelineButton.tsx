'use client';

import { useState } from 'react';

export function RunPipelineButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    const secret = window.prompt('CRON_SECRET (set in Vercel env)');
    if (!secret) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'failed');
      window.location.href = `/p/${data.slug}/pipeline`;
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={run}
        disabled={busy}
        className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {busy ? 'Running pipeline…' : 'Run full pipeline'}
      </button>
      {err && <div className="mt-2 text-xs text-rose-600">{err}</div>}
    </div>
  );
}
