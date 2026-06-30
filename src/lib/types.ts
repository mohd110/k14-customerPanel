export type UserRole = 'customer' | 'restaurant' | 'bakery'
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type PaymentStatus = 'awaiting_verification' | 'paid' | 'failed'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  phone: string | null
}

export interface Store {
  id: string
  name: string
  slug: string
  description: string
  short_desc: string
  logo_url: string | null
  banner_url: string | null
  theme_color: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  photo_url: string | null
  is_available: boolean
  stock?: number
  store_id?: string
}

export interface DeliveryAddress {
  name: string
  phone: string
  alt_phone?: string
  address: string
  pincode: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_order: number
  products?: Pick<Product, 'name' | 'price'>
}

export interface Order {
  id: string
  order_code?: string | null
  order_seq?: number | null
  customer_id: string
  store_id?: string | null
  status: OrderStatus
  delivery_address: DeliveryAddress
  total: number
  note?: string | null
  advance_amount: number
  payment_status: PaymentStatus
  payment_ref: string | null
  payment_proof_url: string | null
  created_at: string
  profiles?: Pick<Profile, 'full_name' | 'phone'>
  order_items?: OrderItem[]
}
