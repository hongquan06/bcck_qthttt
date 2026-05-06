'use client'

import { useState, useEffect } from 'react'
import { Trophy, ArrowRight } from 'lucide-react'
import ProductCard from '../ui/ProductCard'
import { Product } from '@/types'
import { DBProduct } from '@/types/db'
export default function BestSeller() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: DBProduct[]) => {       // ✅ type ở đây
      const mapped = data.slice(0, 4).map((p) => ({
        id: p.id,  // ✅ bỏ String()
        name: p.name,
        price: Number(p.price),
        originalPrice: Number(p.price),
        discount: 0,
        image: p.image_url ?? '',
        category: p.category ?? 'Sản phẩm',
        description: p.description ?? '',
        stock: p.stock ?? 0,
      }))
        setProducts(mapped)
      })
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Trophy size={16} className="text-amber-400" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">BEST SELLER</h2>
            <div className="text-[10px] text-brand-muted font-medium">Bán chạy nhất tháng này</div>
          </div>
        </div>
        <a href="/best-seller" className="hidden sm:flex items-center gap-1.5 text-amber-400 text-sm font-semibold hover:gap-3 transition-all">
          Xem thêm <ArrowRight size={15} />
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  )
}