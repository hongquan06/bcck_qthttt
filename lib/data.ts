export type { Product, Category, BannerSlide } from '@/types'
import { Category, BannerSlide } from '@/types'

export const categories: Category[] = [
  { id: '1', name: 'Điện thoại', icon: '📱', slug: 'dien-thoai' },
  { id: '2', name: 'Laptop', icon: '💻', slug: 'laptop' },
  { id: '3', name: 'Tablet', icon: '📟', slug: 'tablet' },
  { id: '4', name: 'Apple', icon: '🍎', slug: 'apple' },
  { id: '5', name: 'Đồng hồ', icon: '⌚', slug: 'dong-ho' },
  { id: '6', name: 'Phụ kiện', icon: '🎧', slug: 'phu-kien' },
  { id: '7', name: 'Gia dụng', icon: '🏠', slug: 'gia-dung' },
  { id: '8', name: 'Sale', icon: '🔥', slug: 'sale' },
]

export const bannerSlides: BannerSlide[] = [
  {
    id: '1',
    title: 'MEGA TECH SALE',
    subtitle: 'Giảm đến 50% toàn bộ sản phẩm — Chỉ hôm nay',
    discount: '50%',
    cta: 'MUA NGAY',
    bgColor: '#0F0F0F',
    accentColor: '#FF6B00',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    title: 'iPHONE 15 PRO',
    subtitle: 'Titanium. Mạnh mẽ. Đẹp không tưởng.',
    discount: '12%',
    cta: 'KHÁM PHÁ',
    bgColor: '#0F0F0F',
    accentColor: '#60A5FA',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=400&fit=crop',
  },
]

export const navItems = [
  'Điện thoại',
  'Laptop',
  'Máy tính bảng',
  'Apple',
  'Đồng hồ thông minh',
  'Phụ kiện',
  'Gia dụng',
  'Gaming',
  'Khuyến mãi',
]

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}