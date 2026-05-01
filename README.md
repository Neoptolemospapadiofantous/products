# Daily Winners

AI-driven pipeline for finding trending products, generating their landing pages, SEO, social posts, paid ads, and short-form video scripts — and publishing them to social platforms automatically.

## Pipeline (8 stages)

| # | Stage | Description |
|---|---|---|
| 1 | **Discovery** | Claude picks one trending consumer product |
| 2 | **Research** | Market size, competitors, buyer persona, positioning |
| 3 | **Landing** | Hero, benefits, features, FAQ |
| 4 | **SEO** | Meta tags, head + long-tail keywords, JSON-LD schema |
| 5 | **Social** | Tweet, IG caption, TikTok script, LinkedIn post |
| 6 | **Ads** | Facebook headline+primary+CTA, Google headline+description+keywords |
| 7 | **Video** | 15-second short-form video script with scenes |
| 8 | **Publish** | Posts to every platform whose API keys are configured |

## Stack

- Next.js 14 App Router on Vercel
- Claude Opus 4.7 via `@anthropic-ai/sdk`
- Vercel KV for storage
- Vercel Cron (daily at 09:00 UTC)

## Setup — step by step

### 1. Required (run today)

| Key | Get it from |
|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
| `CRON_SECRET` | Generate with `openssl rand -hex 32` |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` (+ companions) | Vercel project → **Storage → Create KV Database** (auto-injects all KV vars) |

Set them under **Vercel project → Settings → Environment Variables** (Production + Preview), then redeploy.

### 2. Optional but recommended

| Key | Why |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (e.g. `https://winners.example.com`) — used as the link in social posts |

### 3. Publishing integrations (each is independent — add only the ones you want)

#### X (Twitter)

1. https://developer.x.com → Project → Keys & Tokens
2. Generate **Consumer Keys** + **Access Token & Secret** (with read+write app permissions)
3. Set: `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`

#### Meta (Facebook + Instagram)

1. https://developers.facebook.com → Create app (Business type)
2. Add **Pages API** + **Instagram Graph API** products
3. Generate a **long-lived Page Access Token** at https://developers.facebook.com/tools/explorer
4. Find your Page ID (page → About → Page ID) and IG Business Account ID
5. Set: `META_PAGE_ACCESS_TOKEN`, `META_PAGE_ID`, optionally `META_IG_USER_ID`, `META_AD_ACCOUNT_ID`

#### TikTok

1. https://developers.tiktok.com → Manage apps → Create
2. Add **Content Posting API** + complete app review
3. Set: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_ACCESS_TOKEN`
4. *Note:* requires a hosted video file — wire up video generation first

#### LinkedIn

1. https://www.linkedin.com/developers/ → Create app
2. Request `w_member_social` scope under **Auth → OAuth 2.0 scopes**
3. Run the OAuth flow once to get a user access token + author URN
4. Set: `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_AUTHOR_URN`

#### Google Ads

1. https://ads.google.com → Tools → API Center → request **developer token** (Basic access ~1-2 weeks)
2. Create OAuth client at https://console.cloud.google.com → Credentials
3. Run OAuth flow to get a refresh token
4. Set: `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`
5. *Note:* the actual campaign-creation logic in `lib/integrations/google-ads.ts` is currently a stub

### 4. Verify keys are set

Visit `/setup` on your deployed app — every required key shows ✅ or ❌.

## Running the pipeline

- **Daily cron:** runs `/api/cron/discover` at 09:00 UTC
- **Manual UI:** click **Run full pipeline** on the home page
- **Manual API:**
  ```bash
  curl -X POST https://your-app.vercel.app/api/pipeline/run \
    -H "x-cron-secret: $CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d '{}'
  # or seed with a specific product:
  curl ... -d '{"name":"LED Sunset Lamp","category":"home decor","whyTrending":"viral on TikTok"}'
  ```
- **Re-run a single stage:**
  ```bash
  curl -X POST https://your-app.vercel.app/api/pipeline/stage \
    -H "x-cron-secret: $CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d '{"slug":"led-sunset-lamp","stage":"social"}'
  ```

## Routes

- `/` — list of products with per-stage status dots
- `/p/[slug]` — public landing page (uses `landing` + `seo` outputs)
- `/p/[slug]/pipeline` — internal dashboard showing every stage's output
- `/setup` — env var status + setup links
- `/api/cron/discover` — Vercel Cron entry point
- `/api/pipeline/run` — run the full pipeline
- `/api/pipeline/stage` — re-run one stage
- `/api/products/[slug]` — JSON read

## Local dev

```bash
npm install
cp .env.example .env.local
# fill in ANTHROPIC_API_KEY and CRON_SECRET (KV won't work locally without Vercel KV creds)
npm run dev
```

## Architecture

- `lib/claude.ts` — one function per stage, all hit Claude Opus 4.7
- `lib/pipeline.ts` — orchestrator (`startPipeline`, `runStage`, `runFullPipeline`)
- `lib/storage.ts` — Vercel KV wrapper, per-stage status tracking
- `lib/integrations/*` — pluggable platform adapters with env contract
- `components/stages/*` — one render component per stage
- `app/api/pipeline/*` — HTTP entry points

Adding a new platform: drop a file in `lib/integrations/`, export an `Integration`, register in `lib/integrations/index.ts`. It'll show up automatically on `/setup` and run during the publish stage.
