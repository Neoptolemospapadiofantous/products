import { NextResponse } from 'next/server';
import { discoverTrendingProduct, generateLandingPage } from '@/lib/claude';
import { listProductNames, saveProduct } from '@/lib/storage';

export const maxDuration = 300;

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const existing = await listProductNames(100);
    const discovery = await discoverTrendingProduct(existing);
    const product = await generateLandingPage(
      discovery.name,
      discovery.category,
      discovery.whyTrending,
    );
    await saveProduct(product);
    return NextResponse.json({ ok: true, slug: product.slug, name: product.name });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
