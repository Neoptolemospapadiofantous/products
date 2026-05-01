import Link from 'next/link';
import { integrations } from '@/lib/integrations';

export const dynamic = 'force-dynamic';

const CORE_KEYS = [
  { key: 'ANTHROPIC_API_KEY', desc: 'Powers all 7 generation stages.', url: 'https://console.anthropic.com/settings/keys' },
  { key: 'CRON_SECRET', desc: 'Auth for /api/cron/* and /api/pipeline/*. Any random string.', url: '' },
  { key: 'KV_REST_API_URL', desc: 'Vercel KV — auto-set by the Vercel KV integration.', url: 'https://vercel.com/dashboard' },
  { key: 'KV_REST_API_TOKEN', desc: 'Vercel KV — auto-set.', url: 'https://vercel.com/dashboard' },
];

const OPTIONAL_KEYS = [
  { key: 'NEXT_PUBLIC_SITE_URL', desc: 'Your deployed URL, e.g. https://example.com — used as the link in social posts.' },
];

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-2 text-3xl font-bold">API setup</h1>
        <p className="mt-2 text-neutral-600">
          Status of every API key the app reads from environment variables. Add keys in your Vercel
          project under <strong>Settings → Environment Variables</strong>, then redeploy.
        </p>
      </header>

      <Section title="Core (required to run the pipeline)">
        {CORE_KEYS.map(({ key, desc, url }) => (
          <Row key={key} envKey={key} desc={desc} url={url} required />
        ))}
      </Section>

      <Section title="Optional">
        {OPTIONAL_KEYS.map(({ key, desc }) => (
          <Row key={key} envKey={key} desc={desc} url="" />
        ))}
      </Section>

      <Section title="Publishing integrations">
        <p className="mb-4 text-sm text-neutral-600">
          Each platform is enabled when all its env vars are set. Missing keys cause that platform
          to be skipped during the publish stage; nothing else breaks.
        </p>
        {integrations.map((integ) => {
          const allSet = integ.requiredEnv.every((e) => Boolean(process.env[e.key]));
          return (
            <div key={integ.id} className="mb-4 rounded-lg border border-neutral-200">
              <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{integ.name}</h3>
                  {allSet ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                      configured
                    </span>
                  ) : (
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                      not configured
                    </span>
                  )}
                  <span className="text-xs text-neutral-500">
                    {integ.capabilities.join(', ')}
                  </span>
                </div>
                <a
                  href={integ.setupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 underline"
                >
                  Setup docs →
                </a>
              </header>
              <ul className="divide-y divide-neutral-100">
                {integ.requiredEnv.map((e) => {
                  const present = Boolean(process.env[e.key]);
                  return (
                    <li key={e.key} className="flex items-center justify-between px-4 py-2 text-sm">
                      <div>
                        <code className="font-mono text-xs">{e.key}</code>
                        <span className="ml-2 text-neutral-500">{e.description}</span>
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          present ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {present ? 'set' : 'missing'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function Row({
  envKey,
  desc,
  url,
  required,
}: {
  envKey: string;
  desc: string;
  url: string;
  required?: boolean;
}) {
  const present = Boolean(process.env[envKey]);
  return (
    <div className="mb-2 flex items-center justify-between rounded border border-neutral-200 px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <code className="font-mono text-sm">{envKey}</code>
          {required && (
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs text-rose-800">required</span>
          )}
        </div>
        <div className="mt-1 text-xs text-neutral-500">{desc}</div>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 underline">
            Get key →
          </a>
        )}
      </div>
      <span
        className={`rounded px-2 py-1 text-xs ${
          present ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}
      >
        {present ? 'set' : 'missing'}
      </span>
    </div>
  );
}
