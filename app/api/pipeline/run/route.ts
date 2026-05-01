import { NextResponse } from 'next/server';
import { runFullPipeline, startPipeline } from '@/lib/pipeline';

export const maxDuration = 300;

function unauthorized(req: Request): boolean {
  const secret = req.headers.get('x-cron-secret');
  return Boolean(process.env.CRON_SECRET) && secret !== process.env.CRON_SECRET;
}

export async function POST(request: Request) {
  if (unauthorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { name?: string; category?: string; whyTrending?: string; slug?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    let slug = body.slug;
    if (!slug) {
      const seed = body.name
        ? {
            name: body.name,
            category: body.category ?? 'general',
            whyTrending: body.whyTrending ?? 'manual seed',
          }
        : undefined;
      const result = await startPipeline(seed);
      slug = result.slug;
    }
    await runFullPipeline(slug);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
