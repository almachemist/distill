export type CustomerType =
  | 'retail'
  | 'wholesale'
  | 'venue'
  | 'bottleshop'
  | 'bar'
  | 'restaurant'

export interface Customer {
  id: string
  name: string
  type: CustomerType
  email?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

