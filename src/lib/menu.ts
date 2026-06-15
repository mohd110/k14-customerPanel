export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  photo: string
  bestseller?: boolean
}

export const MENU: MenuItem[] = [
  // ── RUSKS ──
  {
    id: 'rusk-elaichi',
    name: 'Elaichi Rusk',
    description: 'Crisp cardamom-flavoured toast rusk. Perfect with chai.',
    price: 45,
    category: 'Rusks',
    photo: '',
    bestseller: true,
  },
  {
    id: 'rusk-suji',
    name: 'Suji Toast Rusk',
    description: 'Light semolina rusk, double-baked and crunchy.',
    price: 50,
    category: 'Rusks',
    photo: '',
  },
  {
    id: 'rusk-cake',
    name: 'Premium Cake Rusk',
    description: 'Rich bakery cake rusk, golden and buttery.',
    price: 60,
    category: 'Rusks',
    photo: '',
  },
  {
    id: 'rusk-atta',
    name: 'Atta Rusk',
    description: 'Whole-wheat rusk, lightly sweet and wholesome.',
    price: 48,
    category: 'Rusks',
    photo: '',
  },

  // ── BUNS ──
  {
    id: 'bun-cream',
    name: 'Fresh Cream Bun',
    description: 'Soft milk bun filled with sweet cream. Pack of 4.',
    price: 40,
    category: 'Buns',
    photo: '',
    bestseller: true,
  },
  {
    id: 'bun-pav',
    name: 'Pav Bun',
    description: 'Soft ladi pav, fresh from the bakery. Pack of 6.',
    price: 30,
    category: 'Buns',
    photo: '',
  },
  {
    id: 'bun-burger',
    name: 'Burger Bun',
    description: 'Sesame-topped burger buns. Pack of 4.',
    price: 35,
    category: 'Buns',
    photo: '',
  },

  // ── BIRYANI PACKETS ──
  {
    id: 'biryani-chicken-pkt',
    name: 'Chicken Biryani Packet',
    description: 'Ready-to-cook chicken biryani kit with masala & basmati.',
    price: 120,
    category: 'Biryani Packets',
    photo: '/chicken-biryani.png',
    bestseller: true,
  },
  {
    id: 'biryani-mutton-pkt',
    name: 'Mutton Biryani Kit',
    description: 'Complete mutton biryani kit — rice, spice mix & fried onions.',
    price: 160,
    category: 'Biryani Packets',
    photo: '',
  },
  {
    id: 'biryani-veg-pkt',
    name: 'Veg Biryani Masala Packet',
    description: 'Aromatic veg biryani masala blend. Makes 1 kg rice.',
    price: 80,
    category: 'Biryani Packets',
    photo: '',
  },
  {
    id: 'biryani-hyd-paste',
    name: 'Hyderabadi Biryani Paste',
    description: 'Authentic dum biryani paste, ready to mix and cook.',
    price: 110,
    category: 'Biryani Packets',
    photo: '',
  },

  // ── BISCUITS ──
  {
    id: 'biscuit-marie',
    name: 'Marie Gold Biscuits',
    description: 'Classic light tea biscuits. Family pack.',
    price: 30,
    category: 'Biscuits',
    photo: '',
  },
  {
    id: 'biscuit-bourbon',
    name: 'Bourbon Cream Biscuits',
    description: 'Chocolate cream sandwich biscuits.',
    price: 35,
    category: 'Biscuits',
    photo: '',
    bestseller: true,
  },
  {
    id: 'biscuit-glucose',
    name: 'Glucose Biscuits',
    description: 'Crunchy glucose biscuits, everyday favourite.',
    price: 20,
    category: 'Biscuits',
    photo: '',
  },
  {
    id: 'biscuit-digestive',
    name: 'Digestive Biscuits',
    description: 'High-fibre wheat digestive biscuits.',
    price: 45,
    category: 'Biscuits',
    photo: '',
  },

  // ── NOODLES (Maggi / Yippee) ──
  {
    id: 'maggi-single',
    name: 'Maggi 2-Minute Noodles',
    description: 'Masala instant noodles. Single 70g pack.',
    price: 14,
    category: 'Noodles',
    photo: '',
    bestseller: true,
  },
  {
    id: 'maggi-4pack',
    name: 'Maggi Masala (4-Pack)',
    description: 'Value pack of 4 Maggi masala noodles.',
    price: 56,
    category: 'Noodles',
    photo: '',
  },
  {
    id: 'yippee-single',
    name: 'Yippee Magic Masala',
    description: 'Long, slurpy non-sticky noodles. Single pack.',
    price: 15,
    category: 'Noodles',
    photo: '',
  },
  {
    id: 'yippee-4pack',
    name: 'Yippee Noodles (4-Pack)',
    description: 'Value pack of 4 Yippee Magic Masala noodles.',
    price: 58,
    category: 'Noodles',
    photo: '',
  },
]

// Packaged goods have no add-on toppings.
export const TOPPINGS_MAP: Record<string, { name: string; price: number }[]> = {}
