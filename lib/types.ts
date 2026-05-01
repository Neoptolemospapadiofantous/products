export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  whyTrending: string;
  targetAudience: string;
  priceRange: string;
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  benefits: { title: string; body: string }[];
  features: { title: string; body: string }[];
  faq: { q: string; a: string }[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  social: {
    tweet: string;
    instagramCaption: string;
    tiktokScript: string;
  };
  ad: {
    facebookHeadline: string;
    facebookPrimary: string;
    googleHeadline: string;
    googleDescription: string;
  };
  createdAt: string;
};
