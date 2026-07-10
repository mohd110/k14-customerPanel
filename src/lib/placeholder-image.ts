// Temporary keyword → local placeholder image mapping.
// Used as a fallback when a product has no photo_url set in Supabase,
// so every menu entry shows a relevant test image (e.g. a bun for buns,
// a rusk for rusks). Remove once real product photos are uploaded.

const KEYWORD_IMAGES: [RegExp, string][] = [
  // ── Pista House bakery items (real photos). Listed first so specific
  // matches win over the generic rules below (e.g. "chicken puff" must
  // beat /chicken/, "paneer puff" must beat /paneer/). ──
  [/bun\s*maska/i, '/pista/bun-maska.jpg'],
  [/chicken\s*puff/i, '/pista/chicken-puff.jpg'],
  [/dry\s*fruit\s*puff/i, '/pista/dry-fruit-puff.png'],
  [/french\s*heart/i, '/pista/french-heart.jpg'],
  [/osmania/i, '/pista/osmania-biscuits.jpg'],
  [/paneer\s*puff/i, '/pista/paneer-puff.jpg'],
  [/sponge\s*cake/i, '/pista/sponge-cake-slice.jpg'],
  [/veg\s*puff/i, '/pista/veg-puff.jpg'],
  [/rusk/i, '/k14/cardamom-rusk.png'],
  [/\bbun\b|pav|burger/i, '/k14/sweet-milk-buns.png'],
  [/naan|sweet|bakery|bread/i, '/k14/naan-sweets.png'],
  [/khreet/i, '/k14/signature-khreet.png'],
  [/box|combo|hamper|zaireef|tabbruk/i, '/k14/signature-zaireef-box.png'],
  [/salad|bowl|paneer|veg/i, '/k14/khidmah-salad-bowl.png'],
  [/butter\s*chicken/i, '/butter-chicken.png'],
  [/mutton|korma/i, '/mutton-korma.png'],
  [/kebab|galouti/i, '/galouti-kebab.png'],
  [/tikka/i, '/paneer-tikka.png'],
  [/biryani/i, '/chicken-biryani.png'],
  [/chicken/i, '/chicken-aatishi.png'],
  [/biscuit|marie|bourbon|glucose|digestive/i, '/k14/cardamom-rusk.png'],
  [/maggi|yippee|noodle/i, '/k14/naan-sweets.png'],
]

/** Returns a local placeholder image path that best matches the item name/category. */
export function placeholderImage(name?: string | null, category?: string | null): string {
  const hay = `${name ?? ''} ${category ?? ''}`
  for (const [re, img] of KEYWORD_IMAGES) {
    if (re.test(hay)) return img
  }
  return '/k14/logo.png'
}
