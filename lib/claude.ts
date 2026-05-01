import Anthropic from '@anthropic-ai/sdk';
import type {
  AdsOutput,
  DiscoveryOutput,
  LandingOutput,
  ResearchOutput,
  SeoOutput,
  SocialOutput,
  VideoOutput,
} from './types';

const client = new Anthropic();
const MODEL = 'claude-opus-4-7' as const;

export function slugify(s: string): string {
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

async function ask<T>(prompt: string, maxTokens = 4000): Promise<T> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('no text block');
  return extractJson<T>(block.text);
}

export async function runDiscover(excludeNames: string[] = []): Promise<DiscoveryOutput> {
  const exclude = excludeNames.length
    ? `\n\nDo NOT suggest any of these:\n${excludeNames.map((n) => `- ${n}`).join('\n')}`
    : '';
  return ask<DiscoveryOutput>(
    `Identify ONE specific consumer product with strong dropshipping/e-commerce potential right now. Real, specific (not a category), under $100, visually appealing.

Respond with ONLY a JSON object, no prose, no markdown fences:
{"name": "...", "category": "...", "whyTrending": "1-2 sentence reason"}${exclude}`,
    1024,
  );
}

export async function runResearch(name: string, category: string, whyTrending: string): Promise<ResearchOutput> {
  return ask<ResearchOutput>(
    `Do market research for this product:

Product: ${name}
Category: ${category}
Why trending: ${whyTrending}

Return ONLY a JSON object:
{
  "marketSize": "1-2 sentence sizing/growth note",
  "competitors": [{"name": "competitor brand", "angle": "their positioning"}, ...3 items],
  "buyerPersona": "specific persona description (age, lifestyle, motivation)",
  "pricingInsight": "what price point converts and why",
  "positioning": "the unique angle this product should take vs competitors"
}`,
    2000,
  );
}

export async function runLanding(
  name: string,
  category: string,
  whyTrending: string,
  research?: ResearchOutput,
): Promise<LandingOutput> {
  const ctx = research
    ? `\n\nUse this market research:\nPositioning: ${research.positioning}\nBuyer: ${research.buyerPersona}\nPricing: ${research.pricingInsight}`
    : '';
  return ask<LandingOutput>(
    `Build a landing page for this product:

Product: ${name}
Category: ${category}
Why trending: ${whyTrending}${ctx}

Return ONLY a JSON object:
{
  "tagline": "punchy tagline under 10 words",
  "targetAudience": "one sentence",
  "priceRange": "e.g. $29-49",
  "hero": {"headline": "...", "subheadline": "...", "cta": "..."},
  "benefits": [{"title": "...", "body": "1-2 sentences"}, ...4 items],
  "features": [{"title": "...", "body": "1-2 sentences"}, ...4 items],
  "faq": [{"q": "...", "a": "..."}, ...5 items]
}

Be specific, benefit-focused, conversion-oriented. No fluff.`,
    4000,
  );
}

export async function runSeo(name: string, category: string, landing?: LandingOutput): Promise<SeoOutput> {
  const ctx = landing ? `\n\nLanding hero: ${landing.hero.headline}\nTagline: ${landing.tagline}` : '';
  return ask<SeoOutput>(
    `Write SEO assets for this product page:

Product: ${name}
Category: ${category}${ctx}

Return ONLY a JSON object:
{
  "title": "under 60 chars",
  "description": "under 160 chars, click-worthy",
  "keywords": ["8 short head-term keywords"],
  "longTailKeywords": ["6 long-tail/intent keywords like 'best X for Y'"],
  "metaSchema": "valid JSON-LD Product schema as a string"
}`,
    2000,
  );
}

export async function runSocial(
  name: string,
  category: string,
  landing?: LandingOutput,
): Promise<SocialOutput> {
  const ctx = landing
    ? `\n\nHero: ${landing.hero.headline}\nTop benefit: ${landing.benefits[0]?.title}`
    : '';
  return ask<SocialOutput>(
    `Write social posts for this product:

Product: ${name}
Category: ${category}${ctx}

Return ONLY a JSON object:
{
  "tweet": "under 280 chars, hook-driven",
  "instagramCaption": "with line breaks and 8-10 hashtags",
  "tiktokScript": "3 short punchy lines for a 15s video",
  "linkedinPost": "professional, story-led, 4-6 sentences"
}`,
    2000,
  );
}

export async function runAds(
  name: string,
  category: string,
  landing?: LandingOutput,
): Promise<AdsOutput> {
  const ctx = landing ? `\n\nHero: ${landing.hero.headline}\nCTA: ${landing.hero.cta}` : '';
  return ask<AdsOutput>(
    `Write paid ad copy for this product:

Product: ${name}
Category: ${category}${ctx}

Return ONLY a JSON object:
{
  "facebookHeadline": "under 40 chars, scroll-stopping",
  "facebookPrimary": "primary text 90-150 chars",
  "facebookCta": "one of: Shop Now, Learn More, Get Offer, Sign Up",
  "googleHeadline": "max 30 chars",
  "googleDescription": "max 90 chars",
  "googleKeywords": ["10 high-intent search keywords"]
}`,
    2000,
  );
}

export async function runVideo(
  name: string,
  category: string,
  landing?: LandingOutput,
): Promise<VideoOutput> {
  const ctx = landing
    ? `\n\nHero: ${landing.hero.headline}\nTop benefit: ${landing.benefits[0]?.title}`
    : '';
  return ask<VideoOutput>(
    `Write a 15-second short-form video script (TikTok/Reels/Shorts) for this product:

Product: ${name}
Category: ${category}${ctx}

Return ONLY a JSON object:
{
  "hook": "first 2 seconds — pattern interrupt that stops the scroll",
  "scenes": [
    {"time": "0-3s", "visual": "description of what's on screen", "voiceover": "what's said"},
    ...4-5 scenes covering the full 15s
  ],
  "cta": "final CTA spoken at the end",
  "duration": "~15s"
}`,
    2500,
  );
}
