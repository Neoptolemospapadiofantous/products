import Anthropic from '@anthropic-ai/sdk';
import type { Product } from './types';

const client = new Anthropic();

const MODEL = 'claude-opus-4-7';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
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
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            whyTrending: { type: 'string' },
          },
          required: ['name', 'category', 'whyTrending'],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: 'user',
        content: `Identify ONE specific consumer product with strong dropshipping/e-commerce potential right now. It should be:
- A real, specific product (not a category) that's trending or has rising demand
- Solves a clear problem or fills an aspirational need
- Has a price point under $100 (ideal for impulse buys)
- Has visual appeal (good for social ads)

Return JSON with the product name, category, and a 1-2 sentence reason it's trending.${exclude}`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('no text block');
  return JSON.parse(block.text);
}

export async function generateLandingPage(
  name: string,
  category: string,
  whyTrending: string,
): Promise<Product> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            tagline: { type: 'string' },
            targetAudience: { type: 'string' },
            priceRange: { type: 'string' },
            hero: {
              type: 'object',
              properties: {
                headline: { type: 'string' },
                subheadline: { type: 'string' },
                cta: { type: 'string' },
              },
              required: ['headline', 'subheadline', 'cta'],
              additionalProperties: false,
            },
            benefits: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  body: { type: 'string' },
                },
                required: ['title', 'body'],
                additionalProperties: false,
              },
            },
            features: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  body: { type: 'string' },
                },
                required: ['title', 'body'],
                additionalProperties: false,
              },
            },
            faq: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  q: { type: 'string' },
                  a: { type: 'string' },
                },
                required: ['q', 'a'],
                additionalProperties: false,
              },
            },
            seo: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                keywords: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'description', 'keywords'],
              additionalProperties: false,
            },
            social: {
              type: 'object',
              properties: {
                tweet: { type: 'string' },
                instagramCaption: { type: 'string' },
                tiktokScript: { type: 'string' },
              },
              required: ['tweet', 'instagramCaption', 'tiktokScript'],
              additionalProperties: false,
            },
            ad: {
              type: 'object',
              properties: {
                facebookHeadline: { type: 'string' },
                facebookPrimary: { type: 'string' },
                googleHeadline: { type: 'string' },
                googleDescription: { type: 'string' },
              },
              required: [
                'facebookHeadline',
                'facebookPrimary',
                'googleHeadline',
                'googleDescription',
              ],
              additionalProperties: false,
            },
          },
          required: [
            'tagline',
            'targetAudience',
            'priceRange',
            'hero',
            'benefits',
            'features',
            'faq',
            'seo',
            'social',
            'ad',
          ],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: 'user',
        content: `Create a complete landing page + marketing kit for this product:

Product: ${name}
Category: ${category}
Why trending: ${whyTrending}

Generate:
- A punchy tagline (under 10 words)
- Target audience (one sentence)
- Price range (e.g. "$29-49")
- Hero headline, subheadline, and CTA button copy
- 4 customer benefits (title + 1-2 sentence body)
- 4 product features (title + 1-2 sentence body)
- 5 FAQ entries (real questions a buyer would ask)
- SEO: title (under 60 chars), meta description (under 160 chars), 8 keywords
- Social posts: tweet (under 280 chars), Instagram caption with hashtags, TikTok script (3 short lines)
- Ads: Facebook headline + primary text, Google Ads headline (30 char) + description (90 char)

Be specific, benefit-focused, and conversion-oriented. No fluff, no generic AI-speak.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('no text block');
  const data = JSON.parse(block.text);

  return {
    slug: slugify(name),
    name,
    category,
    whyTrending,
    createdAt: new Date().toISOString(),
    ...data,
  };
}
