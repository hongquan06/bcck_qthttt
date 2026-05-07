'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag, Loader2 } from 'lucide-react'
import { Prisma } from '@prisma/client'
import { cancelOrder } from '@/actions/cancelOrder' // chỉnh lại path nếu khác

type OrderItem = {
  id: number
  quantity: number | null
  price: Prisma.Decimal | null
  products: {
    id: number
    name: string
    image_url: string | null
  } | null
}

type Order = {
  id: number
  total_price: Prisma.Decimal | null
  status: string | null
  created_at: Date | null
  order_items: OrderItem[]
}

type Props = {
  orders: Order[]
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Chờ xác nhận', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',    icon: <Clock size={13} /> },
  paid:      { label: 'Đã thanh toán', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',      icon: <CheckCircle size={13} /> },
  shipped:   { label: 'Đang giao',     color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: <Truck size={13} /> },
  completed: { label: 'Hoàn thành',   color: 'text-green-400 bg-green-400/10 border-green-400/20',    icon: <CheckCircle size={13} /> },
  cancelled: { label: 'Đã hủy',       color: 'text-red-400 bg-red-400/10 border-red-400/20',          icon: <XCircle size={13} /> },
}

// Trạng thái khách hàng được phép hủy
const CANCELLABLE_STATUSES = ['pending', 'paid']

function formatPrice(price: Prisma.Decimal | null) {
  if (price == null) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(price.toNumber()) + 'đ'
}

function formatItemTotal(price: Prisma.Decimal | null, quantity: number | null) {
  if (price == null) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(price.toNumber() * (quantity ?? 0)) + 'đ'
}

function formatDate(date: Date | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Component con để quản lý state hủy đơn riêng cho từng đơn
function OrderCard({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status ?? 'pending')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const st = statusConfig[status] ?? statusConfig.pending
  const canCancel = CANCELLABLE_STATUSES.includes(status)

  function handleCancel() {
    setError(null)
    startTransition(async () => {
      const result = await cancelOrder(order.id)
      if (result.success) {
        setStatus('cancelled')
        setShowConfirm(false)
      } else {
        setError(result.message)
        setShowConfirm(false)
      }
    })
  }

  return (
    <div className="bg-brand-dark-2 rounded-2xl border border-white/5 overflow-hidden">

      {/* Header đơn hàng */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">Đơn #{order.id}</span>
          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${st.color}`}>
            {st.icon} {st.label}
          </span>
        </div>
        <div className="text-right">
          <div className="text-brand-orange font-bold">{formatPrice(order.total_price)}</div>
          <div className="text-brand-muted text-xs mt-0.5">{formatDate(order.created_at)}</div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="divide-y divide-white/5">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-3">
            <div className="w-12 h-12 rounded-xl bg-brand-dark-3 overflow-hidden shrink-0 relative">
              {item.products?.image_url ? (
                <Image
                  src={item.products.image_url}
                  alt={item.products.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={16} className="text-brand-muted" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {item.products?.name ?? 'Sản phẩm đã xóa'}
              </p>
              <p className="text-brand-muted text-xs mt-0.5">
                x{item.quantity} · {formatPrice(item.price)}
              </p>
            </div>
            <div className="text-white font-semibold text-sm shrink-0">
              {formatItemTotal(item.price, item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: nút hủy + thông báo lỗi */}
      {(canCancel || error) && (
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between gap-3">
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
          {!error && <span />}

          {canCancel && !showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isPending}
              className="text-xs font-semibold text-red-400 border border-red-400/30 bg-red-400/5 hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              Hủy đơn
            </button>
          )}

          {canCancel && showConfirm && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-brand-muted text-xs">Xác nhận hủy?</span>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="text-xs font-semibold text-brand-muted border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
              >
                Không
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {isPending && <Loader2 size={11} className="animate-spin" />}
                Xác nhận hủy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function OrderHistory({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-brand-dark pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-white font-bold text-2xl mb-8 flex items-center gap-3">
            <ShoppingBag className="text-brand-orange" size={24} />
            Lịch sử đơn hàng
          </h1>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-dark-2 border border-white/10 flex items-center justify-center mb-4">
              <Package size={28} className="text-brand-muted" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-brand-muted text-sm">Hãy mua sắm và quay lại đây nhé!</p>
            <Link
              href="/"
              className="mt-6 px-6 py-3 rounded-xl bg-brand-orange text-black font-bold text-sm hover:brightness-110 transition">
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-dark pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        <h1 className="text-white font-bold text-2xl mb-8 flex items-center gap-3">
          <ShoppingBag className="text-brand-orange" size={24} />
          Lịch sử đơn hàng
          <span className="text-sm font-normal text-brand-muted">({orders.length} đơn)</span>
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

      </div>
    </main>
  )
}