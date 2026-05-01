import type { SocialOutput } from '@/lib/types';

export function SocialStage({ output }: { output?: SocialOutput }) {
  if (!output) return <p className="text-neutral-500">Social posts not generated yet.</p>;
  return (
    <div className="space-y-3">
      <Post label="Twitter / X" body={output.tweet} />
      <Post label="Instagram" body={output.instagramCaption} />
      <Post label="TikTok script" body={output.tiktokScript} />
      <Post label="LinkedIn" body={output.linkedinPost} />
    </div>
  );
}

function Post({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded border border-neutral-200 p-3">
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm">{body}</div>
    </div>
  );
}
