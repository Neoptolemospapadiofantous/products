# Daily Winners

AI-generated landing pages for trending products. The system:

1. **Daily cron** picks a trending consumer product (Claude API)
2. **Generates** a complete landing page + SEO + ad copy + social posts
3. **Stores** results in Vercel KV and renders them at `/p/[slug]`

## Stack

- Next.js 14 (App Router)
- Claude Opus 4.7 via `@anthropic-ai/sdk` (structured outputs)
- Vercel KV for storage
- Vercel Cron for the daily job

## Required API keys / integrations

| Key                                                | Where to get it                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`                                | https://console.anthropic.com/settings/keys                                |
| `CRON_SECRET` (any random string)                  | Generate with `openssl rand -hex 32`                                       |
| Vercel KV (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) | Vercel dashboard → Storage → Create KV Database (auto-injects env vars)    |

## Deploy to Vercel

1. Import this repo into Vercel
2. Add a **KV Database** under Storage (binds env vars automatically)
3. Set `ANTHROPIC_API_KEY` and `CRON_SECRET` in Project Settings → Environment Variables
4. Deploy. The cron at `/api/cron/discover` runs daily at 09:00 UTC

## Manual generation

```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or pass a specific product:

```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"name":"LED Sunset Lamp","category":"home decor","whyTrending":"viral on TikTok for room aesthetics"}'
```

## Roadmap (not yet implemented)

- Auto-posting to X / Instagram / TikTok via official APIs (requires OAuth flows + per-platform business accounts)
- Auto-launching paid ads via Meta Ads / Google Ads APIs (requires ad accounts + billing)
- Image generation for hero shots
- A/B headline testing

The generated content (`product.social`, `product.ad`) is ready to feed into those integrations.

## Local dev

```bash
npm install
cp .env.example .env.local
# fill in ANTHROPIC_API_KEY and CRON_SECRET
npm run dev
```

KV won't work locally without Vercel KV credentials — easiest is `vercel dev` after linking.
