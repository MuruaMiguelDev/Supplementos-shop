export interface UserProfile {
  id: string
  name: string
  email: string
  favorites?: string[]
  discounts?: Discount[]
}

export interface Discount {
  code: string
  value: number
  type: "percent" | "amount"
  description: string
}
