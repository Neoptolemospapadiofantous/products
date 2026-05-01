import { kv } from '@vercel/kv';
import type { Product } from './types';

const INDEX_KEY = 'products:index';

export async function saveProduct(product: Product): Promise<void> {
  await kv.set(`product:${product.slug}`, product);
  await kv.lpush(INDEX_KEY, product.slug);
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
