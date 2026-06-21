export type UserRole = 'customer' | 'restaurant'
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type PaymentStatus = 'awaiting_verification' | 'paid' | 'failed'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  phone: string | null
}

export interface Product {
  id: string
  name: string
  description: string
  price: number // stored in cents (e.g. 1250 = $12.50)
  photo_url: string | null
  is_available: boolean
  stock?: number // inventory units; reduces as orders are placed
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
  order_code?: string | null // human reference, e.g. "k14/LKO/19062026/OR-3"
  order_seq?: number | null // per-delivery-date serial
  customer_id: string
  status: OrderStatus
  delivery_address: DeliveryAddress
  total: number
  note?: string | null // optional customer instructions captured at checkout
  advance_amount: number
  payment_status: PaymentStatus
  payment_ref: string | null
  payment_proof_url: string | null
  created_at: string
  profiles?: Pick<Profile, 'full_name' | 'phone'>
  order_items?: OrderItem[]
}
