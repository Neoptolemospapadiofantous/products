import Link from 'next/link';
import { listProducts } from '@/lib/storage';
import { RunPipelineButton } from '@/components/RunPipelineButton';
import { STAGE_ORDER, type StageStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const dotColor: Record<StageStatus, string> = {
  pending: 'bg-neutral-300',
  running: 'bg-amber-400 animate-pulse',
  done: 'bg-emerald-500',
  error: 'bg-rose-500',
};

export default async function Home() {
  let products: Awaited<ReturnType<typeof listProducts>> = [];
  let kvError = false;
  try {
    products = await listProducts(50);
  } catch {
    kvError = true;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Daily Winners</h1>
          <p className="mt-3 max-w-xl text-lg text-neutral-600">
            AI-driven pipeline: discover trending products, generate landing pages, SEO, social
            posts, paid ads, video scripts, and publish to social platforms — automatically.
          </p>
          <Link href="/setup" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            View API keys / setup →
          </Link>
        </div>
        <RunPipelineButton />
      </header>

      {kvError && (
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Vercel KV not configured. Add the KV integration in your Vercel project to enable storage.
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-600">No products yet.</p>
          <p className="mt-2 text-sm text-neutral-500">
            Click &ldquo;Run full pipeline&rdquo; above, or wait for the daily 09:00 UTC cron.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <li
              key={p.slug}
              className="rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-400"
            >
              <Link href={`/p/${p.slug}/pipeline`} className="block">
                <div className="text-xs uppercase tracking-wide text-neutral-500">{p.category}</div>
                <h2 className="mt-1 text-xl font-semibold">{p.name}</h2>
                <div className="mt-3 flex items-center gap-1">
                  {STAGE_ORDER.map((stage) => {
                    const status = p.stages[stage]?.status ?? 'pending';
                    return (
                      <div
                        key={stage}
                        title={`${stage}: ${status}`}
                        className={`h-2 w-2 rounded-full ${dotColor[status]}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 text-xs text-neutral-400">
                  {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
