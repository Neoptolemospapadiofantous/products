import { slugify } from '../lib/claude';
import { integrations, envAvailable, missingEnv } from '../lib/integrations';

// reach into claude.ts via re-export for testing
// extractJson isn't exported — replicate the logic to test the contract
function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object');
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}

console.log('=== slugify ===');
console.log(slugify('LED Sunset Lamp'));
console.log(slugify('Hair Growth Oil — Premium Edition!'));
console.log(slugify('   ---  trim me  ---   '));

console.log('\n=== integrations (no env set, all should be unavailable) ===');
for (const i of integrations) {
  console.log(
    `${i.id.padEnd(12)} caps=${i.capabilities.join(',').padEnd(15)} available=${envAvailable(i)} missing=${missingEnv(i).length}`,
  );
}

console.log('\n=== JSON extraction (mimicking Claude responses) ===');
const cases: { name: string; input: string }[] = [
  { name: 'plain JSON', input: '{"name":"Test","ok":true}' },
  { name: 'fenced markdown', input: '```json\n{"name":"Test"}\n```' },
  { name: 'json with prose before', input: 'Here is your product:\n{"name":"Test"}\nHope this helps.' },
  { name: 'nested objects', input: '{"hero":{"headline":"Hi","cta":"Buy"},"benefits":[{"title":"a"}]}' },
];
for (const c of cases) {
  try {
    const out = extractJson(c.input);
    console.log(`✓ ${c.name}: ${JSON.stringify(out).slice(0, 60)}`);
  } catch (e) {
    console.log(`✗ ${c.name}: ${(e as Error).message}`);
  }
}

console.log('\n=== integration availability flips when env is set ===');
process.env.X_API_KEY = 'a';
process.env.X_API_SECRET = 'b';
process.env.X_ACCESS_TOKEN = 'c';
process.env.X_ACCESS_SECRET = 'd';
const x = integrations.find((i) => i.id === 'x')!;
console.log(`x available after setting all 4 env vars: ${envAvailable(x)}`);
delete process.env.X_API_KEY;
console.log(`x available after deleting one: ${envAvailable(x)} (missing: ${missingEnv(x).join(', ')})`);

async function main() {
  console.log('\n=== publish skip semantics (no env, no social ctx) ===');
  const meta = integrations.find((i) => i.id === 'meta')!;
  const results = await meta.publish({ productName: 'Test', category: 'demo' });
  for (const r of results) {
    console.log(
      `  ${r.platform.padEnd(15)} ok=${r.ok} skipped=${r.skipped ?? false} error=${r.error ?? '-'}`,
    );
  }
}
main();
