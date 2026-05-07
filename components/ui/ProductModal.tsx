// components/ui/ProductModal.tsx
'use client'

import { X, ShoppingCart, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types/index'

type Props = {
  product: Product | null
  onClose: () => void
}

export default function ProductModal({ product, onClose }: Props) {
  const router = useRouter()
  const [cartLoading, setCartLoading] = useState(false)
  const [buyLoading, setBuyLoading] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!product) return null

  const price = Number(product.price).toLocaleString('vi-VN') + ' ₫'
  const originalPrice = Number(product.originalPrice).toLocaleString('vi-VN') + ' ₫'

  // ✅ Hàm thêm vào giỏ hàng
  async function handleAddToCart() {
    setCartLoading(true)
    try {
      const res = await fetch('/api/carts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product!.id, quantity: 1 }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      alert('✅ Đã thêm vào giỏ hàng')
    } catch (err) {
      console.error(err)
      alert('❌ Thêm giỏ hàng thất bại')
    } finally {
      setCartLoading(false)
    }
  }

  // ✅ Hàm mua ngay — thêm vào giỏ rồi chuyển sang trang checkout
  async function handleBuyNow() {
    setBuyLoading(true)
    try {
      const res = await fetch('/api/carts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product!.id, quantity: 1 }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      onClose()
      router.push('/checkout') // ✅ Chuyển sang trang checkout
    } catch (err) {
      console.error(err)
      alert('❌ Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setBuyLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-brand-dark-2 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Ảnh */}
        <div className="w-full h-56 bg-brand-dark-3 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thông tin */}
        <div className="p-5 space-y-4">

          {/* Badge + tên */}
          <div>
            {product.badge && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-brand-orange text-white mb-2 inline-block">
                {product.badge}
              </span>
            )}
            <h2 className="text-white font-display font-black text-xl">{product.name}</h2>
            {product.category && (
              <p className="text-brand-muted text-xs uppercase tracking-wider mt-0.5">{product.category}</p>
            )}
            {product.description && (
              <p className="text-brand-muted text-sm mt-2">{product.description}</p>
            )}
          </div>

          {/* Giá */}
          <div className="flex items-end gap-2">
            <span className="text-brand-orange font-black text-2xl">{price}</span>
            {product.discount > 0 && (
              <>
                <span className="text-brand-muted text-sm line-through mb-0.5">{originalPrice}</span>
                <span className="text-green-400 text-xs font-bold mb-0.5">-{product.discount}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          {product.stock !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full font-semibold inline-block ${
              product.stock > 0
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </span>
          )}

          {/* ✅ Nút hành động — đã có onClick */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleBuyNow}
              disabled={buyLoading || product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-orange text-black font-bold text-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={15} className="fill-black" />
              {buyLoading ? 'Đang xử lý...' : 'Mua ngay'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={15} />
              {cartLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}