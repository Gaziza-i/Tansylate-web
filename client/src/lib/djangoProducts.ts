import { djangoAPI, Product } from './api';

let cachedProducts: Product[] = [];

export async function getDjangoProducts(): Promise<Product[]> {
  try {
    const response = await djangoAPI.getProducts();
    cachedProducts = response.results || [];
    return cachedProducts;
  } catch (error) {
    console.error('Failed to fetch products from Django:', error);
    return cachedProducts;
  }
}

export function getCachedProducts(): Product[] {
  return cachedProducts;
}
