import { NextResponse } from 'next/server';
import { discoverTrendingProduct, generateLandingPage } from '@/lib/claude';
import { listProductNames, saveProduct } from '@/lib/storage';

export const maxDuration = 300;

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { name?: string; category?: string; whyTrending?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    let { name, category, whyTrending } = body;
    if (!name) {
      const existing = await listProductNames(100);
      const discovery = await discoverTrendingProduct(existing);
      name = discovery.name;
      category = discovery.category;
      whyTrending = discovery.whyTrending;
    }
    const product = await generateLandingPage(
      name,
      category ?? 'general',
      whyTrending ?? 'manually requested',
    );
    await saveProduct(product);
    return NextResponse.json({ ok: true, slug: product.slug, product });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
