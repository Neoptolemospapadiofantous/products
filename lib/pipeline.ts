import {
  runAds,
  runDiscover,
  runLanding,
  runResearch,
  runSeo,
  runSocial,
  runVideo,
  slugify,
} from './claude';
import { integrations } from './integrations';
import type { PublishResult } from './integrations';
import {
  emptyStages,
  getProduct,
  listProductNames,
  saveProduct,
  setStageError,
  setStageOutput,
  updateStage,
} from './storage';
import type {
  AdsOutput,
  LandingOutput,
  Product,
  ResearchOutput,
  SocialOutput,
  StageName,
  VideoOutput,
} from './types';

export async function startPipeline(seed?: {
  name: string;
  category: string;
  whyTrending: string;
}): Promise<{ slug: string }> {
  const discovery = seed ?? (await runDiscover(await listProductNames(100)));
  const slug = slugify(discovery.name);

  const product: Product = {
    slug,
    name: discovery.name,
    category: discovery.category,
    whyTrending: discovery.whyTrending,
    createdAt: new Date().toISOString(),
    stages: emptyStages(),
  };
  await saveProduct(product);
  await setStageOutput(slug, 'discover', discovery);
  return { slug };
}

export async function runStage(slug: string, stage: StageName): Promise<void> {
  const product = await getProduct(slug);
  if (!product) throw new Error(`product ${slug} not found`);

  await updateStage(slug, stage, { status: 'running' });

  try {
    const { name, category, whyTrending } = product;
    const research = product.stages.research?.output as ResearchOutput | undefined;
    const landing = product.stages.landing?.output as LandingOutput | undefined;

    switch (stage) {
      case 'discover':
        await setStageOutput(slug, 'discover', { name, category, whyTrending });
        break;
      case 'research':
        await setStageOutput(slug, 'research', await runResearch(name, category, whyTrending));
        break;
      case 'landing':
        await setStageOutput(slug, 'landing', await runLanding(name, category, whyTrending, research));
        break;
      case 'seo':
        await setStageOutput(slug, 'seo', await runSeo(name, category, landing));
        break;
      case 'social':
        await setStageOutput(slug, 'social', await runSocial(name, category, landing));
        break;
      case 'ads':
        await setStageOutput(slug, 'ads', await runAds(name, category, landing));
        break;
      case 'video':
        await setStageOutput(slug, 'video', await runVideo(name, category, landing));
        break;
      case 'publish': {
        const social = product.stages.social?.output as SocialOutput | undefined;
        const ads = product.stages.ads?.output as AdsOutput | undefined;
        const video = product.stages.video?.output as VideoOutput | undefined;
        const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';
        const landingUrl = base ? `${base}/p/${slug}` : undefined;
        const ctx = { productName: name, category, social, ads, video, landingUrl };
        const allResults: PublishResult[] = [];
        for (const integration of integrations) {
          try {
            const results = await integration.publish(ctx);
            allResults.push(...results);
          } catch (err) {
            allResults.push({
              ok: false,
              platform: integration.id,
              capability: integration.capabilities[0] ?? 'social',
              error: err instanceof Error ? err.message : 'unknown error',
            });
          }
        }
        await setStageOutput(slug, 'publish', { results: allResults });
        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    await setStageError(slug, stage, message);
    throw err;
  }
}

export async function runFullPipeline(slug: string): Promise<void> {
  // discover already populated by startPipeline; run the rest in dependency order
  const order: StageName[] = ['research', 'landing', 'seo', 'social', 'ads', 'video', 'publish'];
  for (const stage of order) {
    try {
      await runStage(slug, stage);
    } catch {
      // keep going so partial results are stored
    }
  }
}
