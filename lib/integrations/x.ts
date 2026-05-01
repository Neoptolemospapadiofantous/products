import type { Integration, IntegrationContext, PublishResult } from './types';
import { envAvailable, missingEnv } from './types';

/**
 * Posts a tweet using OAuth 1.0a (single-user flow).
 * Get keys at https://developer.x.com → Project → Keys & Tokens.
 *
 * NOTE: full OAuth1 signing is implemented inline (no extra deps).
 */

async function oauth1Sign(
  url: string,
  method: string,
  body: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  token: string,
  tokenSecret: string,
): Promise<string> {
  const params: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: Math.random().toString(36).slice(2),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: token,
    oauth_version: '1.0',
    ...body,
  };
  const sortedKeys = Object.keys(params).sort();
  const baseString =
    `${method.toUpperCase()}&` +
    `${encodeURIComponent(url)}&` +
    encodeURIComponent(sortedKeys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&'));
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  // HMAC-SHA1 via Web Crypto
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(baseString));
  const signature = Buffer.from(sigBytes).toString('base64');
  const authParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: params.oauth_nonce,
    oauth_signature: signature,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: params.oauth_timestamp,
    oauth_token: token,
    oauth_version: '1.0',
  };
  return (
    'OAuth ' +
    Object.entries(authParams)
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(', ')
  );
}

export const xIntegration: Integration = {
  id: 'x',
  name: 'X (Twitter)',
  capabilities: ['social'],
  requiredEnv: [
    { key: 'X_API_KEY', description: 'Consumer API key' },
    { key: 'X_API_SECRET', description: 'Consumer API secret' },
    { key: 'X_ACCESS_TOKEN', description: 'User access token' },
    { key: 'X_ACCESS_SECRET', description: 'User access token secret' },
  ],
  setupUrl: 'https://developer.x.com/en/portal/dashboard',
  async publish(ctx: IntegrationContext): Promise<PublishResult[]> {
    if (!envAvailable(this)) {
      return [
        {
          ok: false,
          platform: this.id,
          capability: 'social',
          skipped: true,
          error: `Missing env: ${missingEnv(this).join(', ')}`,
        },
      ];
    }
    if (!ctx.social) {
      return [{ ok: false, platform: this.id, capability: 'social', skipped: true, error: 'No social copy yet.' }];
    }

    const url = 'https://api.twitter.com/2/tweets';
    const auth = await oauth1Sign(
      url,
      'POST',
      {},
      process.env.X_API_KEY!,
      process.env.X_API_SECRET!,
      process.env.X_ACCESS_TOKEN!,
      process.env.X_ACCESS_SECRET!,
    );
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: ctx.social.tweet }),
    });
    const json = (await res.json()) as { data?: { id: string }; errors?: unknown };
    if (!res.ok || !json.data) {
      return [
        {
          ok: false,
          platform: this.id,
          capability: 'social',
          error: JSON.stringify(json.errors ?? json),
        },
      ];
    }
    return [
      {
        ok: true,
        platform: this.id,
        capability: 'social',
        id: json.data.id,
        url: `https://x.com/i/web/status/${json.data.id}`,
      },
    ];
  },
};
