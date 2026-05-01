import type { Integration, IntegrationContext, PublishResult } from './types';
import { envAvailable, missingEnv } from './types';

/**
 * Posts to a Facebook Page and Instagram Business account.
 *
 * Setup:
 * 1. Create app at https://developers.facebook.com → My Apps
 * 2. Add Facebook Login + Instagram Graph API products
 * 3. Get a long-lived Page Access Token (https://developers.facebook.com/tools/explorer)
 * 4. Find Page ID and connected IG Business Account ID
 *
 * Note: Posting an Instagram image requires hosting an image URL. We post the
 * caption only as a stub here — extend with `image_url` once you wire up image gen.
 */

export const metaIntegration: Integration = {
  id: 'meta',
  name: 'Meta (Facebook + Instagram)',
  capabilities: ['social', 'ad'],
  requiredEnv: [
    { key: 'META_PAGE_ACCESS_TOKEN', description: 'Long-lived Page Access Token' },
    { key: 'META_PAGE_ID', description: 'Facebook Page ID' },
    { key: 'META_IG_USER_ID', description: 'Instagram Business Account ID (optional)' },
    { key: 'META_AD_ACCOUNT_ID', description: 'Ad account ID e.g. act_123 (optional)' },
  ],
  setupUrl: 'https://developers.facebook.com/docs/pages-api/posts',
  async publish(ctx: IntegrationContext): Promise<PublishResult[]> {
    const required = ['META_PAGE_ACCESS_TOKEN', 'META_PAGE_ID'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
      return [
        {
          ok: false,
          platform: this.id,
          capability: 'social',
          skipped: true,
          error: `Missing env: ${missing.join(', ')}`,
        },
      ];
    }
    if (!ctx.social) {
      return [{ ok: false, platform: this.id, capability: 'social', skipped: true, error: 'No social copy yet.' }];
    }

    const results: PublishResult[] = [];
    const token = process.env.META_PAGE_ACCESS_TOKEN!;
    const pageId = process.env.META_PAGE_ID!;

    // Facebook Page post
    const fbUrl = `https://graph.facebook.com/v21.0/${pageId}/feed`;
    const fbBody = new URLSearchParams({
      message: ctx.social.tweet,
      access_token: token,
    });
    if (ctx.landingUrl) fbBody.set('link', ctx.landingUrl);
    const fbRes = await fetch(fbUrl, { method: 'POST', body: fbBody });
    const fbJson = (await fbRes.json()) as { id?: string; error?: { message: string } };
    if (!fbRes.ok || !fbJson.id) {
      results.push({
        ok: false,
        platform: 'meta-facebook',
        capability: 'social',
        error: fbJson.error?.message ?? 'unknown',
      });
    } else {
      results.push({
        ok: true,
        platform: 'meta-facebook',
        capability: 'social',
        id: fbJson.id,
        url: `https://facebook.com/${fbJson.id}`,
      });
    }

    // Instagram (caption-only stub; needs image_url for real publishing)
    if (process.env.META_IG_USER_ID) {
      results.push({
        ok: false,
        platform: 'meta-instagram',
        capability: 'social',
        skipped: true,
        error: 'IG publishing requires an image URL — wire up image generation first.',
      });
    }

    // Ads stub
    if (ctx.ads && process.env.META_AD_ACCOUNT_ID) {
      results.push({
        ok: false,
        platform: 'meta-ads',
        capability: 'ad',
        skipped: true,
        error: 'Ads launch is a stub — see lib/integrations/meta.ts to implement Marketing API calls.',
      });
    }

    return results;
  },
};
