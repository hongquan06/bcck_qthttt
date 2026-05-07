// app/search/page.tsx
'use client'

import { useState, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, ShoppingCart, X, Zap } from 'lucide-react'
import { useProductModal } from '@/lib/ProductModalContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/data'
import type { Product } from '@/types'

function useSearchResults(q: string) {
  const [results, setResults] = useState<Product[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(q ? 'loading' : 'idle')
  const [lastQ, setLastQ] = useState('')
  const [isPending, startTransition] = useTransition()

  if (q && q !== lastQ) {
    setLastQ(q)
    setStatus('loading')
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => startTransition(() => {
        setResults(data)
        setStatus('done')
      }))
      .catch(() => startTransition(() => setStatus('error')))
  }

  if (!q && lastQ !== '') {
    setLastQ('')
    setStatus('idle')
    setResults([])
  }

  return { results, status: isPending ? 'loading' : status }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') ?? ''

  const [inputValue, setInputValue] = useState(q)
  const { results, status } = useSearchResults(q)
  const { openModal } = useProductModal()
  const { showToast } = useToast()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

async function addToCart(e: React.MouseEvent, productId: string | number) {
    e.stopPropagation()
    try {
      const res = await fetch('/api/carts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      })
      if (!res.ok) throw new Error()
      showToast('Đã thêm vào giỏ hàng', 'success')
    } catch {
      showToast('Thêm giỏ hàng thất bại', 'error')
    }
  }

  const isLoading = status === 'loading'

  return (
    <main className="min-h-screen bg-brand-dark pt-6 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Tìm điện thoại, laptop, phụ kiện..."
              autoFocus
              className="w-full bg-brand-dark-2 border border-white/10 focus:border-brand-orange rounded-2xl pl-12 pr-28 py-4 text-white placeholder:text-brand-muted outline-none text-base transition-all focus:shadow-[0_0_0_3px_rgba(255,107,0,0.15)]"
            />
            {inputValue && (
              <button type="button" onClick={() => setInputValue('')}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition">
                <X size={16} />
              </button>
            )}
            <button type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-orange text-black font-bold text-sm px-4 py-2 rounded-xl hover:brightness-110 transition">
              Tìm
            </button>
          </div>
        </form>

        {q && !isLoading && status === 'done' && (
          <p className="text-brand-muted text-sm mb-6">
            Tìm thấy <span className="text-white font-semibold">{results.length}</span> kết quả cho{' '}
            <span className="text-brand-orange font-semibold">{`"${q}"`}</span>
          </p>
        )}
        {q && isLoading && <p className="text-brand-muted text-sm mb-6">Đang tìm kiếm...</p>}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-brand-dark-2 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-5 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && status === 'done' && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((product) => (
              <div key={product.id} onClick={() => openModal(product)}
                className="group bg-brand-dark-2 rounded-2xl border border-white/5 hover:border-brand-orange/30 overflow-hidden cursor-pointer transition-all hover:shadow-xl flex flex-col">
                <div className="relative h-44 bg-brand-dark-3 overflow-hidden">
                  <img src={product.image || product.image_url || '/placeholder.png'} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-2 via-transparent to-transparent opacity-60" />
                </div>
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-brand-orange transition-colors">
                    {product.name}
                  </h3>
                  {product.description && <p className="text-xs text-brand-muted line-clamp-2">{product.description}</p>}
                  <div className="mt-auto">
                    <div className="text-brand-orange font-bold text-lg">{formatPrice(Number(product.price))}</div>
                    {product.stock !== undefined && (
                      <div className={`text-[11px] mt-0.5 ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                      </div>
                    )}
                  </div>
                  <button onClick={e => addToCart(e, product.id)} disabled={product.stock === 0}
                    className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-black font-semibold text-xs transition-all border border-brand-orange/20 hover:border-brand-orange disabled:opacity-40 disabled:cursor-not-allowed">
                    <ShoppingCart size={13} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && status === 'done' && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-dark-2 border border-white/10 flex items-center justify-center mb-4">
              <Search size={28} className="text-brand-muted" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-brand-muted text-sm max-w-xs">
              Không có kết quả nào cho <span className="text-brand-orange">{`"${q}"`}</span>. Thử từ khóa khác nhé.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['iPhone', 'Samsung', 'Laptop', 'MacBook', 'AirPods'].map(term => (
                <button key={term} onClick={() => router.push(`/search?q=${term}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-dark-2 border border-white/10 text-brand-muted hover:text-brand-orange hover:border-brand-orange/30 text-xs transition">
                  <Zap size={11} className="text-brand-orange" />{term}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-dark-2 border border-white/10 flex items-center justify-center mb-4">
              <Search size={28} className="text-brand-orange" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Tìm kiếm sản phẩm</h3>
            <p className="text-brand-muted text-sm">Nhập tên sản phẩm vào ô tìm kiếm ở trên</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['iPhone 15', 'MacBook Air', 'Samsung S24', 'AirPods', 'Laptop Gaming'].map(term => (
                <button key={term} onClick={() => router.push(`/search?q=${term}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-dark-2 border border-white/10 text-brand-muted hover:text-brand-orange hover:border-brand-orange/30 text-xs transition">
                  <Zap size={11} className="text-brand-orange" />{term}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}