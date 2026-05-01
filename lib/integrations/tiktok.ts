import type { Integration, IntegrationContext, PublishResult } from './types';
import { envAvailable, missingEnv } from './types';

/**
 * TikTok Content Posting API stub.
 * Setup: https://developers.tiktok.com/doc/content-posting-api-get-started
 * Requires app review for posting content.
 */

export const tiktokIntegration: Integration = {
  id: 'tiktok',
  name: 'TikTok',
  capabilities: ['social', 'video'],
  requiredEnv: [
    { key: 'TIKTOK_CLIENT_KEY', description: 'App client key' },
    { key: 'TIKTOK_CLIENT_SECRET', description: 'App client secret' },
    { key: 'TIKTOK_ACCESS_TOKEN', description: 'User access token' },
  ],
  setupUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
  async publish(_ctx: IntegrationContext): Promise<PublishResult[]> {
    if (!envAvailable(this)) {
      return [
        {
          ok: false,
          platform: this.id,
          capability: 'video',
          skipped: true,
          error: `Missing env: ${missingEnv(this).join(', ')}`,
        },
      ];
    }
    return [
      {
        ok: false,
        platform: this.id,
        capability: 'video',
        skipped: true,
        error: 'TikTok publishing requires a hosted video file. Wire up video generation, then implement /v2/post/publish/video/init/.',
      },
    ];
  },
};
