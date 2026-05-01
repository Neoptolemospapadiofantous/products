import { kv } from '@vercel/kv';
import type { Product, StageName, StageOutputMap, StageRecord } from './types';

const INDEX_KEY = 'products:index';

export async function saveProduct(product: Product): Promise<void> {
  await kv.set(`product:${product.slug}`, product);
  const existing = await kv.lrange<string>(INDEX_KEY, 0, -1);
  if (!existing.includes(product.slug)) {
    await kv.lpush(INDEX_KEY, product.slug);
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  return (await kv.get<Product>(`product:${slug}`)) ?? null;
}

export async function listProducts(limit = 50): Promise<Product[]> {
  const slugs = await kv.lrange<string>(INDEX_KEY, 0, limit - 1);
  if (!slugs.length) return [];
  const products = await Promise.all(slugs.map((s) => getProduct(s)));
  return products.filter((p): p is Product => p !== null);
}

export async function listProductNames(limit = 100): Promise<string[]> {
  const products = await listProducts(limit);
  return products.map((p) => p.name);
}

export async function updateStage<K extends StageName>(
  slug: string,
  stage: K,
  patch: Partial<StageRecord<K>>,
): Promise<Product | null> {
  const product = await getProduct(slug);
  if (!product) return null;
  const prev = product.stages[stage] ?? { status: 'pending', updatedAt: new Date().toISOString() };
  const next = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  } as StageRecord<K>;
  // Cast through unknown — TS can't see that K → stages[K] is StageRecord<K>
  (product.stages as Record<StageName, StageRecord<StageName>>)[stage] = next as StageRecord<StageName>;
  await saveProduct(product);
  return product;
}

export async function setStageOutput<K extends StageName>(
  slug: string,
  stage: K,
  output: StageOutputMap[K],
): Promise<Product | null> {
  return updateStage(slug, stage, { status: 'done', output, error: undefined });
}

export async function setStageError(
  slug: string,
  stage: StageName,
  error: string,
): Promise<Product | null> {
  return updateStage(slug, stage, { status: 'error', error });
}

export function emptyStages(): Product['stages'] {
  return {};
}
