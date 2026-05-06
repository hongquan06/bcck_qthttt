'use client'

import { Product, formatPrice } from '../../lib/data'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { useProductModal } from '@/lib/ProductModalContext'

interface ProductCardProps {
  product: Product
  index?: number
}

const badgeColors: Record<string, string> = {
  HOT: 'bg-red-500',
  BEST: 'bg-brand-orange',
  NEW: 'bg-blue-500',
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { openModal } = useProductModal()
  const badgeClass = badgeColors[product.badge || ''] || 'bg-brand-orange'

  // 👉 THÊM GIỎ HÀNG
async function addToCart(productId: number) {
  try {
    const res = await fetch("/api/carts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId, // ✅ FIX Ở ĐÂY
        quantity: 1,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text)
    }

    alert("✅ Đã thêm vào giỏ hàng")
  } catch (err) {
    console.error(err)
    alert("❌ Thêm giỏ hàng thất bại")
  }
}
  return (
    <div
      onClick={() => openModal(product)}
      className="product-card group relative bg-brand-dark-2 rounded-2xl border border-white/5 hover:border-brand-orange/20 overflow-hidden flex flex-col cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Badge */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.badge && (
          <span className={`${badgeClass} text-white text-[10px] font-black px-2 py-0.5 rounded-md tracking-wide`}>
            {product.badge}
          </span>
        )}
        {product.discount > 0 && !product.badge?.includes('%') && (
          <span className="bg-brand-dark text-brand-orange text-[10px] font-bold px-2 py-0.5 rounded-md border border-brand-orange/30">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={e => e.stopPropagation()}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-brand-dark/60 backdrop-blur-sm flex items-center justify-center text-brand-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all border border-white/10"
      >
        <Heart size={14} />
      </button>

      {/* Image */}
      <div className="relative h-44 sm:h-52 bg-gradient-to-b from-brand-dark-3 to-brand-dark-2 flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-2 via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
          {product.category}
        </div>

        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-brand-orange transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={
                    i < Math.floor(product.rating!)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-brand-gray-light'
                  }
                />
              ))}
            </div>
            <span className="text-[10px] text-brand-muted">
              {product.rating} ({product.sold?.toLocaleString()})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto">
          <div className="text-brand-orange font-display font-bold text-lg">
            {formatPrice(product.price)}
          </div>
          <div className="text-brand-muted text-xs line-through">
            {formatPrice(product.originalPrice)}
          </div>
        </div>

        {/* 👉 NÚT THÊM GIỎ */}
        <button
          onClick={e => {
            e.stopPropagation()
            addToCart(Number(product.id))
          }}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-black font-semibold text-xs transition-all duration-200 border border-brand-orange/20 hover:border-brand-orange"
        >
          <ShoppingCart size={14} />
          <span>Thêm vào giỏ</span>
        </button>
      </div>
    </div>
  )
}