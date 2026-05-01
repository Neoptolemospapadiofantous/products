import Link from 'next/link';
import { listProducts } from '@/lib/storage';

export const dynamic = 'force-dynamic';

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
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Daily Winners</h1>
        <p className="mt-3 text-lg text-neutral-600">
          AI finds a trending product every day, builds the landing page, writes
          the ads, and drafts the social posts.
        </p>
      </header>

      {kvError && (
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Vercel KV not configured yet. Add the KV integration in your Vercel
          project to enable storage.
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-600">No products yet.</p>
          <p className="mt-2 text-sm text-neutral-500">
            The cron runs daily at 9:00 UTC, or trigger it manually:
          </p>
          <code className="mt-3 inline-block rounded bg-neutral-100 px-3 py-1 text-xs">
            POST /api/generate (with x-cron-secret header)
          </code>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <li
              key={p.slug}
              className="rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-400"
            >
              <Link href={`/p/${p.slug}`} className="block">
                <div className="text-xs uppercase tracking-wide text-neutral-500">
                  {p.category}
                </div>
                <h2 className="mt-1 text-xl font-semibold">{p.name}</h2>
                <p className="mt-2 text-sm text-neutral-600">{p.tagline}</p>
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
