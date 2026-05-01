import type { Integration, IntegrationContext, PublishResult } from './types';
import { envAvailable, missingEnv } from './types';

/**
 * Google Ads campaign launch stub.
 * Setup: https://developers.google.com/google-ads/api/docs/get-started/introduction
 * Requires: developer token (basic access takes ~1-2 weeks to approve), OAuth client, refresh token.
 */

export const googleAdsIntegration: Integration = {
  id: 'google-ads',
  name: 'Google Ads',
  capabilities: ['ad'],
  requiredEnv: [
    { key: 'GOOGLE_ADS_DEVELOPER_TOKEN', description: 'Google Ads developer token' },
    { key: 'GOOGLE_ADS_CLIENT_ID', description: 'OAuth client ID' },
    { key: 'GOOGLE_ADS_CLIENT_SECRET', description: 'OAuth client secret' },
    { key: 'GOOGLE_ADS_REFRESH_TOKEN', description: 'OAuth refresh token' },
    { key: 'GOOGLE_ADS_CUSTOMER_ID', description: 'Customer ID (no dashes), e.g. 1234567890' },
  ],
  setupUrl: 'https://developers.google.com/google-ads/api/docs/first-call/overview',
  async publish(_ctx: IntegrationContext): Promise<PublishResult[]> {
    if (!envAvailable(this)) {
      return [
        {
          ok: false,
          platform: this.id,
          capability: 'ad',
          skipped: true,
          error: `Missing env: ${missingEnv(this).join(', ')}`,
        },
      ];
    }
    return [
      {
        ok: false,
        platform: this.id,
        capability: 'ad',
        skipped: true,
        error: 'Google Ads launch is a stub — implement campaign + ad-group + RSA creation via the Ads API.',
      },
    ];
  },
};
