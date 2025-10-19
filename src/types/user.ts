export interface UserProfile {
  id: string
  name: string
  email: string
  favorites: string[] // product ids
  discounts?: Discount[]
}

export interface Discount {
  code: string
  value: number
  type: "percent" | "amount"
  description?: string
  expiresAt?: Date
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
  shippingAddress: ShippingAddress
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
}

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}
