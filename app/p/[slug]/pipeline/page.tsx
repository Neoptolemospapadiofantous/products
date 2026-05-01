import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/storage';
import { STAGE_ORDER } from '@/lib/types';
import type {
  AdsOutput,
  DiscoveryOutput,
  LandingOutput,
  ResearchOutput,
  SeoOutput,
  SocialOutput,
  VideoOutput,
} from '@/lib/types';
import { StageCard } from '@/components/StageCard';
import { DiscoveryStage } from '@/components/stages/DiscoveryStage';
import { ResearchStage } from '@/components/stages/ResearchStage';
import { LandingStage } from '@/components/stages/LandingStage';
import { SeoStage } from '@/components/stages/SeoStage';
import { SocialStage } from '@/components/stages/SocialStage';
import { AdsStage } from '@/components/stages/AdsStage';
import { VideoStage } from '@/components/stages/VideoStage';

export const dynamic = 'force-dynamic';

export default async function PipelinePage({ params }: { params: { slug: string } }) {
  let product;
  try {
    product = await getProduct(params.slug);
  } catch {
    notFound();
  }
  if (!product) notFound();

  const stages = product.stages;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <Link href="/" className="text-sm text-neutral-500 hover:underline">
            ← All products
          </Link>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <p className="text-neutral-500">{product.category}</p>
        </div>
        <Link
          href={`/p/${product.slug}`}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
        >
          View landing page
        </Link>
      </header>

      <div className="space-y-6">
        {STAGE_ORDER.map((stage) => {
          const record = stages[stage];
          let body: React.ReactNode;
          switch (stage) {
            case 'discover':
              body = <DiscoveryStage output={record?.output as DiscoveryOutput | undefined} />;
              break;
            case 'research':
              body = <ResearchStage output={record?.output as ResearchOutput | undefined} />;
              break;
            case 'landing':
              body = (
                <LandingStage
                  slug={product.slug}
                  output={record?.output as LandingOutput | undefined}
                />
              );
              break;
            case 'seo':
              body = <SeoStage output={record?.output as SeoOutput | undefined} />;
              break;
            case 'social':
              body = <SocialStage output={record?.output as SocialOutput | undefined} />;
              break;
            case 'ads':
              body = <AdsStage output={record?.output as AdsOutput | undefined} />;
              break;
            case 'video':
              body = <VideoStage output={record?.output as VideoOutput | undefined} />;
              break;
          }
          return (
            <StageCard
              key={stage}
              slug={product.slug}
              stage={stage}
              record={record}
              rerunnable={stage !== 'discover'}
            >
              {body}
            </StageCard>
          );
        })}
      </div>
    </main>
  );
}
