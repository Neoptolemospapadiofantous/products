import type { VideoOutput } from '@/lib/types';

export function VideoStage({ output }: { output?: VideoOutput }) {
  if (!output) return <p className="text-neutral-500">Video script not generated yet.</p>;
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs uppercase text-neutral-500">Hook ({output.duration})</div>
        <div className="font-medium">{output.hook}</div>
      </div>
      <ol className="space-y-2">
        {output.scenes.map((s, i) => (
          <li key={i} className="rounded border border-neutral-200 p-3">
            <div className="text-xs font-mono text-neutral-500">{s.time}</div>
            <div className="mt-1">
              <span className="text-xs uppercase text-neutral-500">Visual:</span> {s.visual}
            </div>
            <div className="mt-1">
              <span className="text-xs uppercase text-neutral-500">VO:</span> {s.voiceover}
            </div>
          </li>
        ))}
      </ol>
      <div className="rounded bg-neutral-900 p-3 text-sm text-white">
        <span className="text-xs uppercase text-neutral-400">CTA:</span> {output.cta}
      </div>
    </div>
  );
}
