import type { AdsOutput } from '@/lib/types';

export function AdsStage({ output }: { output?: AdsOutput }) {
  if (!output) return <p className="text-neutral-500">Ads not generated yet.</p>;
  return (
    <div className="space-y-3">
      <div className="rounded border border-blue-200 bg-blue-50 p-3">
        <div className="mb-1 text-xs uppercase text-blue-700">Facebook / Instagram</div>
        <div className="font-semibold">{output.facebookHeadline}</div>
        <div className="mt-1 text-sm">{output.facebookPrimary}</div>
        <div className="mt-2 inline-block rounded bg-blue-600 px-3 py-1 text-xs text-white">
          {output.facebookCta}
        </div>
      </div>
      <div className="rounded border border-green-200 bg-green-50 p-3">
        <div className="mb-1 text-xs uppercase text-green-700">Google Ads</div>
        <div className="font-semibold">
          {output.googleHeadline} <span className="text-xs text-neutral-500">({output.googleHeadline.length}c)</span>
        </div>
        <div className="text-sm">
          {output.googleDescription}{' '}
          <span className="text-xs text-neutral-500">({output.googleDescription.length}c)</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {output.googleKeywords.map((k, i) => (
            <span key={i} className="rounded bg-white px-2 py-0.5 text-xs">
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
