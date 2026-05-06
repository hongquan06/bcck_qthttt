'use client'

import { useState, useEffect } from 'react'
import { Zap, ArrowRight } from 'lucide-react'
import ProductCard from '../ui/ProductCard'
import { Product } from '@/types'
import { DBProduct } from '@/types/db'

function useCountdown(targetHours: number) {
  const [timeLeft, setTimeLeft] = useState({ h: targetHours, m: 45, s: 30 })
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return { h: 0, m: 0, s: 0 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  return timeLeft
}

function TimeSegment({ value, label }: { value: number; label: string }) {
  const str = value.toString().padStart(2, '0')
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {str.split('').map((d, i) => (
          <div key={i} className="w-7 h-9 bg-brand-dark rounded-lg flex items-center justify-center font-display font-black text-lg text-brand-orange border border-brand-orange/20">
            {d}
          </div>
        ))}
      </div>
      <span className="text-[9px] text-brand-muted font-semibold uppercase tracking-wider">{label}</span>
    </div>
  )
}

export default function FlashSale() {
  const time = useCountdown(2)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: DBProduct[]) => {       // ✅ type ở đây
      const mapped = data.slice(0, 6).map((p) => ({  // ✅ bỏ type ở map
          id: p.id,
          name: p.name,
          price: Number(p.price),
          originalPrice: Number(p.price),
          discount: 0,
          image: p.image_url ?? '',
          category: p.category ?? 'Sản phẩm',
          description: p.description ?? '',
          stock: p.stock ?? 0,
          badge: 'HOT',
        }))
        setProducts(mapped)
      })
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
              <Zap size={16} className="text-black fill-black" />
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">FLASH SALE</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand-muted text-xs">Kết thúc trong</span>
            <div className="flex items-center gap-1">
              <TimeSegment value={time.h} label="GIỜ" />
              <span className="text-brand-orange font-black text-lg mb-3">:</span>
              <TimeSegment value={time.m} label="PHÚT" />
              <span className="text-brand-orange font-black text-lg mb-3">:</span>
              <TimeSegment value={time.s} label="GIÂY" />
            </div>
          </div>
        </div>
        <a href="/flash-sale" className="hidden sm:flex items-center gap-1.5 text-brand-orange text-sm font-semibold hover:gap-3 transition-all">
          Xem tất cả <ArrowRight size={15} />
        </a>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {products.map((p) => {
          const soldPct = Math.min(((p.sold || 0) / 5000) * 100, 95)
          return (
            <div key={p.id} className="shrink-0 flex-1 min-w-0">
              <div className="h-1 bg-brand-dark-3 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-orange to-amber-400 rounded-full"
                  style={{ width: `${soldPct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      <a href="/flash-sale" className="sm:hidden mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-brand-orange text-sm font-semibold">
        Xem tất cả Flash Sale <ArrowRight size={15} />
      </a>
    </section>
  )
}