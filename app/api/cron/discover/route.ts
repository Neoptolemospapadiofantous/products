import { NextResponse } from 'next/server';
import { runFullPipeline, startPipeline } from '@/lib/pipeline';

export const maxDuration = 300;

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await startPipeline();
    await runFullPipeline(slug);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
