export interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  discount: number
  image: string
  badge?: string
  rating?: number
  sold?: number
  isNew?: boolean
  category: string
  description?: string  
  stock?: number     
}

export interface Category {
  id: string
  name: string
  icon: string
  slug: string
}

export interface BannerSlide {
  id: string
  title: string
  subtitle: string
  discount: string
  cta: string
  bgColor: string
  accentColor: string
  image: string
}
