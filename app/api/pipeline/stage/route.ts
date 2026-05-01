import { NextResponse } from 'next/server';
import { runStage } from '@/lib/pipeline';
import { STAGE_ORDER } from '@/lib/types';
import type { StageName } from '@/lib/types';

export const maxDuration = 120;

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { slug?: string; stage?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { slug, stage } = body;
  if (!slug || !stage) {
    return NextResponse.json({ error: 'missing slug or stage' }, { status: 400 });
  }
  if (!STAGE_ORDER.includes(stage as StageName)) {
    return NextResponse.json({ error: `invalid stage: ${stage}` }, { status: 400 });
  }

  try {
    await runStage(slug, stage as StageName);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
