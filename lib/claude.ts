import Anthropic from '@anthropic-ai/sdk';
import type { Product } from './types';

const client = new Anthropic();

const MODEL = 'claude-opus-4-5';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object in response');
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}

export async function discoverTrendingProduct(
  excludeNames: string[] = [],
): Promise<{ name: string; category: string; whyTrending: string }> {
  const exclude =
    excludeNames.length > 0
      ? `\n\nDo NOT suggest any of these (we already have them):\n${excludeNames.map((n) => `- ${n}`).join('\n')}`
      : '';

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Identify ONE specific consumer product with strong dropshipping/e-commerce potential right now. It should be:
- A real, specific product (not a category) that's trending or has rising demand
- Solves a clear problem or fills an aspirational need
- Has a price point under $100
- Has visual appeal (good for social ads)

Respond with ONLY a JSON object, no prose, no markdown fences:
{"name": "...", "category": "...", "whyTrending": "1-2 sentence reason"}${exclude}`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('no text block');
  return extractJson(block.text);
}

export async function generateLandingPage(
  name: string,
  category: string,
  whyTrending: string,
): Promise<Product> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `Create a complete landing page + marketing kit for this product:

Product: ${name}
Category: ${category}
Why trending: ${whyTrending}

Respond with ONLY a JSON object, no prose, no markdown fences, with this exact shape:

{
  "tagline": "punchy tagline under 10 words",
  "targetAudience": "one sentence",
  "priceRange": "e.g. $29-49",
  "hero": {"headline": "...", "subheadline": "...", "cta": "..."},
  "benefits": [{"title": "...", "body": "1-2 sentences"}, ...4 items],
  "features": [{"title": "...", "body": "1-2 sentences"}, ...4 items],
  "faq": [{"q": "...", "a": "..."}, ...5 items],
  "seo": {"title": "under 60 chars", "description": "under 160 chars", "keywords": ["..."]},
  "social": {"tweet": "under 280 chars", "instagramCaption": "with hashtags", "tiktokScript": "3 short lines"},
  "ad": {"facebookHeadline": "...", "facebookPrimary": "...", "googleHeadline": "30 chars", "googleDescription": "90 chars"}
}

Be specific, benefit-focused, and conversion-oriented. No fluff, no generic AI-speak.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('no text block');
  const data = extractJson<Omit<Product, 'slug' | 'name' | 'category' | 'whyTrending' | 'createdAt'>>(block.text);

  return {
    slug: slugify(name),
    name,
    category,
    whyTrending,
    createdAt: new Date().toISOString(),
    ...data,
  };
}
