import type { ResearchOutput } from '@/lib/types';

export function ResearchStage({ output }: { output?: ResearchOutput }) {
  if (!output) return <p className="text-neutral-500">Not yet researched.</p>;
  return (
    <div className="space-y-3">
      <Field label="Market size" value={output.marketSize} />
      <Field label="Buyer persona" value={output.buyerPersona} />
      <Field label="Pricing insight" value={output.pricingInsight} />
      <Field label="Positioning" value={output.positioning} />
      <div>
        <div className="mb-1 text-xs uppercase text-neutral-500">Competitors</div>
        <ul className="space-y-1">
          {output.competitors.map((c, i) => (
            <li key={i} className="rounded bg-neutral-50 px-3 py-2">
              <span className="font-medium">{c.name}</span> — {c.angle}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className="text-neutral-700">{value}</div>
    </div>
  );
}
