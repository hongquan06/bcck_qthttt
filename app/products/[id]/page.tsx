'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ShoppingCart, ArrowLeft, Star, Shield, Truck, CreditCard } from 'lucide-react'
import Link from 'next/link'

type Product = {
  id: number
  name: string
  description: string
  price: number
  stock: number
  image_url: string
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetch(`/api/products?id=${id}`)
      .then(res => res.json())
      .then(data => { setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-white text-lg animate-pulse">Đang tải sản phẩm...</div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-4">
      <div className="text-white text-lg">Không tìm thấy sản phẩm</div>
      <Link href="/" className="text-brand-orange hover:underline">Quay về trang chủ</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-brand-muted hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Quay lại
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Ảnh */}
          <div className="rounded-2xl overflow-hidden bg-brand-dark-2 border border-white/5 aspect-square flex items-center justify-center">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thông tin */}
          <div className="flex flex-col gap-5">
            <h1 className="text-2xl sm:text-3xl font-black leading-tight">{product.name}</h1>

            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="text-brand-muted text-sm ml-1">5.0</span>
            </div>

            <div className="text-brand-orange font-black text-4xl">
              {new Intl.NumberFormat('vi-VN').format(Number(product.price))}đ
            </div>

            <p className="text-brand-muted leading-relaxed">{product.description}</p>

            <div className="text-sm text-brand-muted">
              Tình trạng:{' '}
              <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            {/* Số lượng */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-brand-muted">Số lượng:</span>
              <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-white/5 text-white transition-colors"
                >−</button>
                <span className="px-4 py-2 text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-2 hover:bg-white/5 text-white transition-colors"
                >+</button>
              </div>
            </div>

            {/* Nút mua */}
            <button
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-orange text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} />
              Thêm vào giỏ hàng
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: CreditCard, label: 'Trả góp 0%', sub: '12 tháng' },
                { icon: Truck, label: 'Giao hàng 2H', sub: 'Nội thành' },
                { icon: Shield, label: 'Bảo hành', sub: 'Chính hãng' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-brand-dark-2 border border-white/5">
                  <Icon size={16} className="text-brand-orange" />
                  <div className="text-xs font-semibold text-white">{label}</div>
                  <div className="text-[10px] text-brand-muted">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}