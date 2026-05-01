import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct } from '@/lib/storage';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);
    if (!product) return { title: 'Not found' };
    return {
      title: product.seo.title,
      description: product.seo.description,
      keywords: product.seo.keywords,
      openGraph: {
        title: product.seo.title,
        description: product.seo.description,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.seo.title,
        description: product.seo.description,
      },
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

  return (
    <main>
      <section className="bg-gradient-to-b from-neutral-50 to-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
            {product.category}
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            {product.hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-neutral-600">
            {product.hero.subheadline}
          </p>
          <button className="mt-8 rounded-lg bg-neutral-900 px-8 py-4 text-lg font-medium text-white hover:bg-neutral-800">
            {product.hero.cta}
          </button>
          <p className="mt-4 text-sm text-neutral-500">{product.priceRange}</p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold">Why you&apos;ll love it</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {product.benefits.map((b, i) => (
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
            {product.features.map((f, i) => (
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
            {product.faq.map((item, i) => (
              <details key={i} className="group py-5">
                <summary className="cursor-pointer list-none font-medium">
                  {item.q}
                </summary>
                <p className="mt-3 text-neutral-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold">{product.hero.headline}</h2>
          <p className="mt-4 text-lg text-neutral-300">{product.tagline}</p>
          <button className="mt-8 rounded-lg bg-white px-8 py-4 text-lg font-medium text-neutral-900 hover:bg-neutral-100">
            {product.hero.cta}
          </button>
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-10 text-sm text-neutral-500">
        <div className="mx-auto max-w-5xl">
          <p>
            <strong>Trending because:</strong> {product.whyTrending}
          </p>
          <p className="mt-2">Generated {new Date(product.createdAt).toLocaleDateString()}</p>
        </div>
      </footer>
    </main>
  );
}
