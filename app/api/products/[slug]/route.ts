import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await getProduct(params.slug);
    if (!product) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
