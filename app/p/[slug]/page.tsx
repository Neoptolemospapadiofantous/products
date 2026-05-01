import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct } from '@/lib/storage';
import type { LandingOutput, SeoOutput } from '@/lib/types';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);
    if (!product) return { title: 'Not found' };
    const seo = product.stages.seo?.output as SeoOutput | undefined;
    if (!seo) return { title: product.name };
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      openGraph: {
        title: seo.title,
        description: seo.description,
        type: 'website',
      },
      twitter: { card: 'summary_large_image', title: seo.title, description: seo.description },
    };
  } catch {
    return { title: 'Not found' };
  }
}

export default async function ProductPage({ params }: Props) {
  let product;
  try {
    product = await getProduct(params.slug);
  } catch {
    notFound();
  }
  if (!product) notFound();

  const landing = product.stages.landing?.output as LandingOutput | undefined;

  if (!landing) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-3 text-neutral-600">Landing page not generated yet.</p>
        <Link
          href={`/p/${product.slug}/pipeline`}
          className="mt-6 inline-block rounded bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          Open pipeline
        </Link>
      </main>
    );
  }

  return (
    <main>
      <section className="bg-gradient-to-b from-neutral-50 to-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
            {product.category}
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">{landing.hero.headline}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-neutral-600">
            {landing.hero.subheadline}
          </p>
          <button className="mt-8 rounded-lg bg-neutral-900 px-8 py-4 text-lg font-medium text-white hover:bg-neutral-800">
            {landing.hero.cta}
          </button>
          <p className="mt-4 text-sm text-neutral-500">{landing.priceRange}</p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold">Why you&apos;ll love it</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {landing.benefits.map((b, i) => (
              <div key={i}>
                <h3 className="text-xl font-semibold">{b.title}</h3>
                <p className="mt-2 text-neutral-600">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold">Features</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {landing.features.map((f, i) => (
              <div key={i} className="rounded-lg bg-white p-6">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold">Frequently asked</h2>
          <div className="mt-8 divide-y divide-neutral-200">
            {landing.faq.map((item, i) => (
              <details key={i} className="group py-5">
                <summary className="cursor-pointer list-none font-medium">{item.q}</summary>
                <p className="mt-3 text-neutral-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold">{landing.hero.headline}</h2>
          <p className="mt-4 text-lg text-neutral-300">{landing.tagline}</p>
          <button className="mt-8 rounded-lg bg-white px-8 py-4 text-lg font-medium text-neutral-900 hover:bg-neutral-100">
            {landing.hero.cta}
          </button>
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-10 text-sm text-neutral-500">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <p>
            <strong>Trending because:</strong> {product.whyTrending}
          </p>
          <Link
            href={`/p/${product.slug}/pipeline`}
            className="rounded border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
          >
            Pipeline →
          </Link>
        </div>
      </footer>
    </main>
  );
}
