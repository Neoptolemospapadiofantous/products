import Link from 'next/link';
import type { LandingOutput } from '@/lib/types';

export function LandingStage({ slug, output }: { slug: string; output?: LandingOutput }) {
  if (!output) return <p className="text-neutral-500">Landing page not generated yet.</p>;
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs uppercase text-neutral-500">Tagline</div>
        <div className="font-medium">{output.tagline}</div>
      </div>
      <div className="rounded bg-neutral-50 p-3">
        <div className="text-lg font-bold">{output.hero.headline}</div>
        <div className="mt-1 text-sm text-neutral-600">{output.hero.subheadline}</div>
        <div className="mt-2 inline-block rounded bg-neutral-900 px-3 py-1 text-xs text-white">
          {output.hero.cta}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs uppercase text-neutral-500">Benefits</div>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {output.benefits.map((b, i) => (
              <li key={i}>
                <strong>{b.title}</strong> — {b.body}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase text-neutral-500">Features</div>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {output.features.map((f, i) => (
              <li key={i}>
                <strong>{f.title}</strong> — {f.body}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link
        href={`/p/${slug}`}
        className="inline-block rounded border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50"
      >
        View live page →
      </Link>
    </div>
  );
}
