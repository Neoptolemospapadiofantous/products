import Link from 'next/link';
import type { PublishOutput } from '@/lib/types';

export function PublishStage({ output }: { output?: PublishOutput }) {
  if (!output) return <p className="text-neutral-500">Not yet published.</p>;
  if (output.results.length === 0) return <p className="text-neutral-500">No integrations ran.</p>;
  return (
    <ul className="space-y-2">
      {output.results.map((r, i) => (
        <li key={i} className="flex items-start justify-between rounded border border-neutral-200 p-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{r.platform}</span>
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                {r.capability}
              </span>
              {r.ok ? (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800">
                  posted
                </span>
              ) : r.skipped ? (
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                  skipped
                </span>
              ) : (
                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs text-rose-800">failed</span>
              )}
            </div>
            {r.error && <div className="mt-1 text-xs text-neutral-500">{r.error}</div>}
            {r.url && (
              <Link href={r.url} target="_blank" className="mt-1 inline-block text-xs text-blue-600 underline">
                View post
              </Link>
            )}
          </div>
        </li>
      ))}
      <li className="pt-2 text-center">
        <Link href="/setup" className="text-xs text-neutral-500 hover:underline">
          Configure more platforms →
        </Link>
      </li>
    </ul>
  );
}
