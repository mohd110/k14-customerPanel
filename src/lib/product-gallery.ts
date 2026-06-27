// Per-product image galleries — Single Pack + Bulk Packaging shots cropped
// from the bakery look-book sheets (public/products/<slug>-single|bulk.jpg).
// Keyed by the product's Supabase id (stable UUIDs from the seed migrations).
// The menu card shows these as a swipeable slider; falls back to photo_url
// / placeholder for any product not listed here.

export const PRODUCT_GALLERY: Record<string, string[]> = {
  // ── Existing items (006) ──
  'a1000000-0000-4000-8000-000000000001': ['/products/vanilla-muffin-single.jpg', '/products/vanilla-muffin-bulk.jpg'],
  'a1000000-0000-4000-8000-000000000002': ['/products/dry-cake-single.jpg', '/products/dry-cake-bulk.jpg'],
  'a1000000-0000-4000-8000-000000000003': ['/products/khari-jeera-single.jpg', '/products/khari-jeera-bulk.jpg'],
  'a1000000-0000-4000-8000-000000000004': ['/products/khari-ajwain-single.jpg', '/products/khari-ajwain-bulk.jpg'],
  'a1000000-0000-4000-8000-000000000009': ['/products/mathri-single.jpg', '/products/mathri-bulk.jpg'],
  'a1000000-0000-4000-8000-00000000000a': ['/products/namak-para-single.jpg', '/products/namak-para-bulk.jpg'],
  // ── New items (008) ──
  'a1000000-0000-4000-8000-00000000000b': ['/products/butter-jeera-cookies-single.jpg', '/products/butter-jeera-cookies-bulk.jpg'],
  'a1000000-0000-4000-8000-00000000000c': ['/products/delicious-jeera-cookies-single.jpg', '/products/delicious-jeera-cookies-bulk.jpg'],
  'a1000000-0000-4000-8000-00000000000d': ['/products/butter-ajwain-cookies-single.jpg', '/products/butter-ajwain-cookies-bulk.jpg'],
  'a1000000-0000-4000-8000-00000000000e': ['/products/delicious-ajwain-cookies-single.jpg', '/products/delicious-ajwain-cookies-bulk.jpg'],
  'a1000000-0000-4000-8000-00000000000f': ['/products/butter-sweet-cookies-single.jpg', '/products/butter-sweet-cookies-bulk.jpg'],
  'a1000000-0000-4000-8000-000000000010': ['/products/delicious-sweet-cookies-single.jpg', '/products/delicious-sweet-cookies-bulk.jpg'],
  'a1000000-0000-4000-8000-000000000011': ['/products/bun-maska-single.jpg', '/products/bun-maska-bulk.jpg'],
  'a1000000-0000-4000-8000-000000000012': ['/products/namak-para-small-single.jpg', '/products/namak-para-small-bulk.jpg'],
}

/** Captions paired with each slide, in order. */
export const GALLERY_CAPTIONS = ['Single Pack', 'Bulk Packaging']

/** Returns the gallery image list for a product, or null if none is mapped. */
export function galleryFor(id: string): string[] | null {
  return PRODUCT_GALLERY[id] ?? null
}
