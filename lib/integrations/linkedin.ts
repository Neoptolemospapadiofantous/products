import type { Integration, IntegrationContext, PublishResult } from './types';
import { envAvailable, missingEnv } from './types';

/**
 * LinkedIn UGC post (text only).
 * Setup: https://www.linkedin.com/developers/ → Create app → Auth → request "w_member_social" scope
 */

export const linkedinIntegration: Integration = {
  id: 'linkedin',
  name: 'LinkedIn',
  capabilities: ['social'],
  requiredEnv: [
    { key: 'LINKEDIN_ACCESS_TOKEN', description: 'OAuth 2.0 user access token (w_member_social)' },
    { key: 'LINKEDIN_AUTHOR_URN', description: 'Author URN, e.g. urn:li:person:abc123' },
  ],
  setupUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api',
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
      return [{ ok: false, platform: this.id, capability: 'social', skipped: true, error: 'No social copy.' }];
    }

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: process.env.LINKEDIN_AUTHOR_URN,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: ctx.social.linkedinPost },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });
    const json = (await res.json()) as { id?: string; message?: string };
    if (!res.ok || !json.id) {
      return [
        {
          ok: false,
          platform: this.id,
          capability: 'social',
          error: json.message ?? `HTTP ${res.status}`,
        },
      ];
    }
    return [{ ok: true, platform: this.id, capability: 'social', id: json.id }];
  },
};
