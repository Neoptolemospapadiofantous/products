import type { DiscoveryOutput } from '@/lib/types';

export function DiscoveryStage({ output }: { output?: DiscoveryOutput }) {
  if (!output) return <p className="text-neutral-500">No discovery yet.</p>;
  return (
    <dl className="space-y-2">
      <div>
        <dt className="text-xs uppercase text-neutral-500">Product</dt>
        <dd className="font-medium">{output.name}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase text-neutral-500">Category</dt>
        <dd>{output.category}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase text-neutral-500">Why trending</dt>
        <dd className="text-neutral-700">{output.whyTrending}</dd>
      </div>
    </dl>
  );
}
