import type { Integration } from './types';
import { xIntegration } from './x';
import { metaIntegration } from './meta';
import { tiktokIntegration } from './tiktok';
import { linkedinIntegration } from './linkedin';
import { googleAdsIntegration } from './google-ads';

export const integrations: Integration[] = [
  xIntegration,
  metaIntegration,
  tiktokIntegration,
  linkedinIntegration,
  googleAdsIntegration,
];

export { envAvailable, missingEnv } from './types';
export type { Integration, IntegrationContext, PublishResult, Capability } from './types';
