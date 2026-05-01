import type { AdsOutput, SocialOutput, VideoOutput } from '../types';

export type Capability = 'social' | 'ad' | 'video';

export type IntegrationContext = {
  productName: string;
  category: string;
  social?: SocialOutput;
  ads?: AdsOutput;
  video?: VideoOutput;
  landingUrl?: string;
};

export type PublishResult = {
  ok: boolean;
  platform: string;
  capability: Capability;
  url?: string;
  id?: string;
  error?: string;
  skipped?: boolean;
};

export type Integration = {
  /** Stable id used in env, storage. */
  id: string;
  /** Human-readable name. */
  name: string;
  capabilities: Capability[];
  /** Required env vars; integration is "available" only when all are set. */
  requiredEnv: { key: string; description: string }[];
  /** URL with setup instructions. */
  setupUrl: string;
  /** Run the publish action. Should throw on hard failures, return skipped if not configured. */
  publish(ctx: IntegrationContext): Promise<PublishResult[]>;
};

export function envAvailable(integration: Integration): boolean {
  return integration.requiredEnv.every((e) => Boolean(process.env[e.key]));
}

export function missingEnv(integration: Integration): string[] {
  return integration.requiredEnv.filter((e) => !process.env[e.key]).map((e) => e.key);
}
