// K14 Tabbruk — static UI constants.
// Menu products now come from Supabase (see src/lib/types.ts → Product).

export type Category = 'Bakery' | 'Biryani' | 'Desserts' | 'Cakes'

export const CATEGORIES: Category[] = ['Bakery', 'Biryani', 'Desserts', 'Cakes']

// Daily offerings shown on the splash / landing page (static imagery).
export const DAILY_OFFERINGS = [
  {
    id: 'traditional-khreet',
    label: 'SIGNATURE DISH',
    name: 'Traditional Khreet',
    description: 'Large khidmah bookings available.',
    image: '/k14/signature-khreet.png',
  },
  {
    id: 'naan-sweets',
    label: 'BAKERY',
    name: 'Naan & Sweets',
    description: 'Freshly baked breads and traditional sweets.',
    image: '/k14/naan-sweets.png',
  },
]
