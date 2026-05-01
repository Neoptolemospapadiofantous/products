import type { SeoOutput } from '@/lib/types';

export function SeoStage({ output }: { output?: SeoOutput }) {
  if (!output) return <p className="text-neutral-500">SEO not generated yet.</p>;
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs uppercase text-neutral-500">Title ({output.title.length} chars)</div>
        <div className="font-medium">{output.title}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-neutral-500">
          Description ({output.description.length} chars)
        </div>
        <div>{output.description}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-neutral-500">Keywords</div>
        <div className="flex flex-wrap gap-1">
          {output.keywords.map((k, i) => (
            <span key={i} className="rounded bg-neutral-100 px-2 py-0.5 text-xs">
              {k}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs uppercase text-neutral-500">Long-tail</div>
        <div className="flex flex-wrap gap-1">
          {output.longTailKeywords.map((k, i) => (
            <span key={i} className="rounded bg-neutral-50 px-2 py-0.5 text-xs">
              {k}
            </span>
          ))}
        </div>
      </div>
      <details>
        <summary className="cursor-pointer text-xs uppercase text-neutral-500">JSON-LD schema</summary>
        <pre className="mt-2 overflow-x-auto rounded bg-neutral-900 p-3 text-xs text-neutral-100">
          {output.metaSchema}
        </pre>
      </details>
    </div>
  );
}
