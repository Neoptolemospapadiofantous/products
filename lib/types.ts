export type StageName =
  | 'discover'
  | 'research'
  | 'landing'
  | 'seo'
  | 'social'
  | 'ads'
  | 'video'
  | 'publish';

export const STAGE_ORDER: StageName[] = [
  'discover',
  'research',
  'landing',
  'seo',
  'social',
  'ads',
  'video',
  'publish',
];

export const STAGE_LABELS: Record<StageName, string> = {
  discover: 'Discovery',
  research: 'Market Research',
  landing: 'Landing Page',
  seo: 'SEO',
  social: 'Social Posts',
  ads: 'Paid Ads',
  video: 'Video Script',
  publish: 'Publish',
};

export type StageStatus = 'pending' | 'running' | 'done' | 'error';

export type DiscoveryOutput = {
  name: string;
  category: string;
  whyTrending: string;
};

export type ResearchOutput = {
  marketSize: string;
  competitors: { name: string; angle: string }[];
  buyerPersona: string;
  pricingInsight: string;
  positioning: string;
};

export type LandingOutput = {
  tagline: string;
  targetAudience: string;
  priceRange: string;
  hero: { headline: string; subheadline: string; cta: string };
  benefits: { title: string; body: string }[];
  features: { title: string; body: string }[];
  faq: { q: string; a: string }[];
};

export type SeoOutput = {
  title: string;
  description: string;
  keywords: string[];
  longTailKeywords: string[];
  metaSchema: string;
};

export type SocialOutput = {
  tweet: string;
  instagramCaption: string;
  tiktokScript: string;
  linkedinPost: string;
};

export type AdsOutput = {
  facebookHeadline: string;
  facebookPrimary: string;
  facebookCta: string;
  googleHeadline: string;
  googleDescription: string;
  googleKeywords: string[];
};

export type VideoOutput = {
  hook: string;
  scenes: { time: string; visual: string; voiceover: string }[];
  cta: string;
  duration: string;
};

export type PublishOutput = {
  results: {
    ok: boolean;
    platform: string;
    capability: 'social' | 'ad' | 'video';
    url?: string;
    id?: string;
    error?: string;
    skipped?: boolean;
  }[];
};

export type StageOutputMap = {
  discover: DiscoveryOutput;
  research: ResearchOutput;
  landing: LandingOutput;
  seo: SeoOutput;
  social: SocialOutput;
  ads: AdsOutput;
  video: VideoOutput;
  publish: PublishOutput;
};

export type StageRecord<K extends StageName = StageName> = {
  status: StageStatus;
  updatedAt: string;
  output?: StageOutputMap[K];
  error?: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  whyTrending: string;
  createdAt: string;
  stages: { [K in StageName]?: StageRecord<K> };
};
