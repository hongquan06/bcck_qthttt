// components/ui/SearchResults.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Zap } from 'lucide-react'
import { useProductModal } from '@/lib/ProductModalContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/data'
import type { Product } from '@/types'

type Props = {
  q: string
  results: Product[]
}

const SUGGESTIONS = ['iPhone 15', 'MacBook Air', 'Samsung S24', 'AirPods', 'Laptop Gaming']

export default function SearchResults({ q, results }: Props) {
  const router = useRouter()
  const { openModal } = useProductModal()
  const { showToast } = useToast()

  async function addToCart(e: React.MouseEvent, productId: string | number) {
    e.stopPropagation()
    try {
      const token = localStorage.getItem('token') // hoặc cách bạn lưu token
      const res = await fetch('/api/carts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ product_id: Number(productId), quantity: 1 }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }
      showToast('Đã thêm vào giỏ hàng', 'success')
    } catch (err) {
      console.error(err)
      showToast('Vui lòng đăng nhập để thêm vào giỏ', 'error')
    }
  }

  return (
    <main className="min-h-screen bg-brand-dark pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Tiêu đề kết quả */}
        {q && (
          <div className="mb-6">
            <h1 className="text-white font-bold text-xl">
              Kết quả cho{' '}
              <span className="text-brand-orange">{`"${q}"`}</span>
            </h1>
            <p className="text-brand-muted text-sm mt-1">
              Tìm thấy <span className="text-white font-semibold">{results.length}</span> sản phẩm
            </p>
          </div>
        )}

        {/* Có kết quả */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => openModal(product)}
                className="group bg-brand-dark-2 rounded-2xl border border-white/5 hover:border-brand-orange/20 overflow-hidden cursor-pointer transition-all flex flex-col"
              >
                <div className="relative h-44 sm:h-52 bg-gradient-to-b from-brand-dark-3 to-brand-dark-2 overflow-hidden">
                  <img
                    src={product.image_url || product.image || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-2 via-transparent to-transparent opacity-60" />
                </div>
                <div className="p-4 flex flex-col flex-1 gap-2">
                  {product.category && (
                    <div className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                      {product.category}
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-brand-orange transition-colors">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-brand-muted line-clamp-2">{product.description}</p>
                  )}
                  <div className="mt-auto">
                    <div className="text-brand-orange font-display font-bold text-lg">
                      {formatPrice(Number(product.price))}
                    </div>
                    {product.stock != null && (
                      <div className={`text-[11px] mt-0.5 ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={e => addToCart(e, product.id)}
                    disabled={product.stock === 0}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-black font-semibold text-xs transition-all border border-brand-orange/20 hover:border-brand-orange disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={13} />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Không có kết quả */}
        {q && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-dark-2 border border-white/10 flex items-center justify-center mb-4">
              <Search size={28} className="text-brand-muted" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-brand-muted text-sm max-w-xs">
              Không có kết quả nào cho{' '}
              <span className="text-brand-orange">{`"${q}"`}</span>. Thử từ khóa khác nhé.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(term => (
                <button
                  key={term}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-dark-2 border border-white/10 text-brand-muted hover:text-brand-orange hover:border-brand-orange/30 text-xs transition"
                >
                  <Zap size={11} className="text-brand-orange" /> {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Idle */}
        {!q && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-dark-2 border border-white/10 flex items-center justify-center mb-4">
              <Search size={28} className="text-brand-orange" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Tìm kiếm sản phẩm</h3>
            <p className="text-brand-muted text-sm">Nhập tên sản phẩm vào ô tìm kiếm phía trên</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(term => (
                <button
                  key={term}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-dark-2 border border-white/10 text-brand-muted hover:text-brand-orange hover:border-brand-orange/30 text-xs transition"
                >
                  <Zap size={11} className="text-brand-orange" /> {term}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}