// types/db.ts
export interface DBProduct {
  id: number
  name: string
  price: string | number
  description?: string | null
  stock?: number | null
  image_url?: string | null
  category?: string | null
  created_at?: Date | null
}