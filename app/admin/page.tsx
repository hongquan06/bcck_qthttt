import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { orders_status } from '@prisma/client'

type AdminPageProps = {
  searchParams: Promise<{
    status?: string | string[]
  }>
}

const LOW_STOCK_THRESHOLD = 5

const statusMap = {
  created: {
    title: '✅ Da them san pham moi',
    description: 'San pham vua duoc dua len gian hang va se hien thi sau khi tai lai trang.',
    className: 'border-l-4 border-l-emerald-500 border border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  },
  updated: {
    title: '✏️ Da cap nhat san pham',
    description: 'Thong tin gia, ton kho va mo ta da duoc luu thanh cong.',
    className: 'border-l-4 border-l-sky-500 border border-sky-500/20 bg-sky-500/10 text-sky-200',
  },
  removed: {
    title: '🗑️ Da go san pham khoi gian hang',
    description: 'San pham het hang hoac khong con kinh doanh da duoc xoa khoi danh muc.',
    className: 'border-l-4 border-l-amber-500 border border-amber-500/20 bg-amber-500/10 text-amber-100',
  },
  invalid: {
    title: '⚠️ Du lieu chua hop le',
    description: 'Hay kiem tra lai ten, gia ban va ton kho truoc khi gui.',
    className: 'border-l-4 border-l-red-500 border border-red-500/20 bg-red-500/10 text-red-200',
  },
  order_updated: {
    title: '✅ Da cap nhat trang thai don hang',
    description: 'Trang thai don hang da duoc luu thanh cong. Khach hang se thay ngay.',
    className: 'border-l-4 border-l-emerald-500 border border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  },
  order_invalid: {
    title: '⚠️ Khong the cap nhat don hang',
    description: 'Trang thai khong hop le hoac don hang khong ton tai.',
    className: 'border-l-4 border-l-red-500 border border-red-500/20 bg-red-500/10 text-red-200',
  },
} as const

const orderStatusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  paid:      { label: 'Đã thanh toán', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  shipped:   { label: 'Đang giao',     color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  completed: { label: 'Hoàn thành',   color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  cancelled: { label: 'Đã hủy',       color: 'text-red-400 bg-red-400/10 border-red-400/20' },
}

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled']

function getFirstValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0]
  return value
}

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value)
  return normalized.length > 0 ? normalized : null
}

function parseCurrencyValue(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value).replace(/\./g, '').replace(/,/g, '.')
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function parseStockValue(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value)
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.trunc(parsed)
}

function formatCurrency(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Chua co du lieu'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(date: Date | null | undefined) {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

async function createProduct(formData: FormData) {
  'use server'
  const name = normalizeText(formData.get('name'))
  const description = normalizeOptionalText(formData.get('description'))
  const imageUrl = normalizeOptionalText(formData.get('image_url'))
  const price = parseCurrencyValue(formData.get('price'))
  const stock = parseStockValue(formData.get('stock'))
  if (!name || price === null || stock === null) redirect('/admin?status=invalid')
  await prisma.products.create({ data: { name, description, image_url: imageUrl, price, stock } })
  revalidatePath('/admin')
  redirect('/admin?status=created')
}

async function updateProduct(productId: number, formData: FormData) {
  'use server'
  const name = normalizeText(formData.get('name'))
  const description = normalizeOptionalText(formData.get('description'))
  const imageUrl = normalizeOptionalText(formData.get('image_url'))
  const price = parseCurrencyValue(formData.get('price'))
  const stock = parseStockValue(formData.get('stock'))
  if (!name || price === null || stock === null) redirect('/admin?status=invalid')
  await prisma.products.update({ where: { id: productId }, data: { name, description, image_url: imageUrl, price, stock } })
  revalidatePath('/admin')
  redirect('/admin?status=updated')
}

async function removeProduct(productId: number) {
  'use server'
  await prisma.products.delete({ where: { id: productId } })
  revalidatePath('/admin')
  redirect('/admin?status=removed')
}

async function updateOrderStatus(orderId: number, formData: FormData) {
  'use server'
  const newStatus = normalizeText(formData.get('status'))
  if (!ORDER_STATUSES.includes(newStatus)) redirect('/admin?status=order_invalid')
  await prisma.orders.update({
    where: { id: orderId },
    data: { status: newStatus as orders_status },
  })
  revalidatePath('/admin')
  revalidatePath('/orders') // cập nhật trang lịch sử đơn hàng của khách
  redirect('/admin?status=order_updated')
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await connection()

  const resolvedSearchParams = await searchParams
  const statusKey = getFirstValue(resolvedSearchParams.status)
  const statusMessage = statusKey ? statusMap[statusKey as keyof typeof statusMap] : null

  const products = await prisma.products.findMany({
    orderBy: [{ stock: 'asc' }, { created_at: 'desc' }],
  })

  const orders = await prisma.orders.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      order_items: {
        include: { products: true },
      },
      users: {
        select: { email: true },
      },
    },
  })

  const inventory = products.map((product) => {
    const stock = product.stock ?? 0
    const price = Number(product.price)
    return {
      ...product,
      stock,
      price,
      status: stock <= 0 ? 'out' : stock <= LOW_STOCK_THRESHOLD ? 'low' : 'active',
    }
  })

  const totalProducts = inventory.length
  const outOfStockProducts = inventory.filter((p) => p.stock <= 0)
  const lowStockProducts = inventory.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)
  const activeProducts = inventory.filter((p) => p.stock > LOW_STOCK_THRESHOLD)
  const totalUnits = inventory.reduce((sum, p) => sum + p.stock, 0)

  // Thống kê đơn hàng
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length
  const completedOrders = orders.filter((o) => o.status === 'completed').length

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      {/* ── Top admin bar ── */}
      <div className="border-b border-white/8 bg-brand-dark-2/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange font-black text-black text-sm">
              A
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Admin Panel</span>
              <span className="mx-2 text-white/20">·</span>
              <span className="text-xs text-brand-muted">FPT Shop</span>
            </div>
          </div>
          <Link href="/" className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-brand-muted transition hover:text-white">
            ← Ve trang chu
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Status notification ── */}
        {statusMessage && (
          <div className={`rounded-2xl px-5 py-4 text-sm ${statusMessage.className}`}>
            <div className="font-semibold">{statusMessage.title}</div>
            <div className="mt-1 opacity-80">{statusMessage.description}</div>
          </div>
        )}

        {/* ── Hero stats ── */}
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-orange/15 via-transparent to-transparent p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Admin Inventory Control</p>
              <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Quan tri hang hoa FPT Shop
              </h1>
              <p className="mt-1 text-sm text-brand-muted">
                Theo doi, them, sua, xoa san pham va giam sat ton kho toan he thong.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:shrink-0">
              {[
                { label: 'Tong SKU', value: totalProducts, color: 'text-white' },
                { label: 'Dang ban', value: activeProducts.length, color: 'text-emerald-400' },
                { label: 'Sap het', value: lowStockProducts.length, color: 'text-amber-400' },
                { label: 'Tong ton', value: totalUnits, color: 'text-white' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-brand-muted">{stat.label}</div>
                  <div className={`mt-1 font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Main grid: Alert + Form ── */}
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">

          {/* Canh bao ton kho */}
          <section className="rounded-2xl border border-white/10 bg-brand-dark-2">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-white">⚠️ Can xu ly ngay</h2>
                <p className="mt-0.5 text-xs text-brand-muted">Mat hang het hoac sap het hang</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-brand-muted">
                Nguong: {LOW_STOCK_THRESHOLD}
              </span>
            </div>

            <div className="grid gap-4 p-6 lg:grid-cols-2">
              <div className="rounded-xl border border-red-500/25 bg-red-500/5">
                <div className="flex items-center justify-between border-b border-red-500/15 px-4 py-3">
                  <h3 className="text-sm font-semibold text-red-300">Het hang</h3>
                  <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-300">
                    {outOfStockProducts.length}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  {outOfStockProducts.length > 0 ? (
                    outOfStockProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`#product-${product.id}`}
                        className="flex items-center justify-between rounded-lg border border-white/8 bg-black/20 px-3 py-2.5 transition hover:border-red-400/30 hover:bg-red-500/5"
                      >
                        <span className="text-sm font-medium text-white">{product.name}</span>
                        <span className="text-xs text-red-400">0 sp</span>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-xs text-brand-muted">
                      Kho on dinh ✓
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/25 bg-amber-500/5">
                <div className="flex items-center justify-between border-b border-amber-500/15 px-4 py-3">
                  <h3 className="text-sm font-semibold text-amber-300">Sap het hang</h3>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    {lowStockProducts.length}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`#product-${product.id}`}
                        className="flex items-center justify-between rounded-lg border border-white/8 bg-black/20 px-3 py-2.5 transition hover:border-amber-400/30 hover:bg-amber-500/5"
                      >
                        <span className="text-sm font-medium text-white">{product.name}</span>
                        <span className="text-xs text-amber-400">Con {product.stock}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-xs text-brand-muted">
                      Khong co canh bao ✓
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Form them san pham */}
          <section className="rounded-2xl border border-white/10 bg-brand-dark-2">
            <div className="border-b border-white/8 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-white">➕ Them san pham moi</h2>
              <p className="mt-0.5 text-xs text-brand-muted">Dua mat hang moi len gian hang</p>
            </div>

            <form action={createProduct} className="grid gap-4 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs">
                  <span className="font-medium text-brand-muted">Ten san pham *</span>
                  <input
                    name="name"
                    required
                    placeholder="Vi du: iPhone 16 128GB"
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                  />
                </label>
                <label className="grid gap-1.5 text-xs">
                  <span className="font-medium text-brand-muted">Gia ban (VND) *</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1000"
                    required
                    placeholder="24990000"
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs">
                  <span className="font-medium text-brand-muted">Ton kho ban dau *</span>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="20"
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                  />
                </label>
                <label className="grid gap-1.5 text-xs">
                  <span className="font-medium text-brand-muted">Hinh anh (URL)</span>
                  <input
                    name="image_url"
                    placeholder="https://..."
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-xs">
                <span className="font-medium text-brand-muted">Mo ta san pham</span>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Mo ta noi bat, cau hinh, uu dai..."
                  className="resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-3 text-sm font-bold text-black transition hover:opacity-90 active:scale-[0.98]"
              >
                Dang san pham moi
              </button>
            </form>
          </section>
        </div>

        {/* ── Quản lý đơn hàng ── */}
        <section className="rounded-2xl border border-white/10 bg-brand-dark-2">
          {/* Header + stats */}
          <div className="flex flex-col gap-4 border-b border-white/8 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-white">🛒 Quan ly don hang</h2>
              <p className="mt-0.5 text-xs text-brand-muted">Cap nhat trang thai don hang cho khach</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Tong', value: totalOrders, color: 'text-white border-white/10 bg-white/5' },
                { label: 'Cho xac nhan', value: pendingOrders, color: 'text-amber-400 border-amber-400/20 bg-amber-400/5' },
                { label: 'Dang giao', value: shippedOrders, color: 'text-purple-400 border-purple-400/20 bg-purple-400/5' },
                { label: 'Hoan thanh', value: completedOrders, color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border px-3 py-1.5 text-center ${s.color}`}>
                  <div className="text-[10px] uppercase tracking-widest opacity-70">{s.label}</div>
                  <div className="text-sm font-bold">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-brand-muted text-sm">Chua co don hang nao.</p>
              </div>
            ) : (
              orders.map((order) => {
                const st = orderStatusConfig[order.status ?? 'pending'] ?? orderStatusConfig.pending
                const totalPrice = Number(order.total_price ?? 0)

                return (
                  <article key={order.id} className="px-6 py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      {/* Thong tin don hang */}
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white">Don #{order.id}</span>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${st.color}`}>
                            {st.label}
                          </span>
                        </div>

                        {/* Khach hang */}
                        <div className="text-xs text-brand-muted">
                          <span className="text-white/70">{order.users?.email ?? 'Khach hang'}</span>
                        </div>

                        {/* San pham trong don */}
                        <div className="flex flex-col gap-1">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="text-xs text-brand-muted">
                              · {item.products?.name ?? 'San pham da xoa'}{' '}
                              <span className="text-white/50">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-brand-muted">
                          <span className="font-bold text-brand-orange">
                            {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ
                          </span>
                          <span>·</span>
                          <span>{formatDateTime(order.created_at)}</span>
                        </div>
                      </div>

                      {/* Form cap nhat trang thai */}
                      <form
                        action={updateOrderStatus.bind(null, order.id)}
                        className="flex shrink-0 items-center gap-2"
                      >
                        <select
                          name="status"
                          defaultValue={order.status ?? 'pending'}
                          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-orange cursor-pointer"
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="paid">Đã thanh toán</option>
                          <option value="shipped">Đang giao</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 active:scale-[0.98] whitespace-nowrap"
                        >
                          Cập nhật
                        </button>
                      </form>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>

        {/* ── Danh sach san pham ── */}
        <section className="rounded-2xl border border-white/10 bg-brand-dark-2">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white">📦 Danh sach hang hoa</h2>
              <p className="mt-0.5 text-xs text-brand-muted">Quan ly tat ca san pham trong he thong</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-brand-muted">
              {inventory.length} san pham
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {inventory.length > 0 ? (
              inventory.map((product) => {
                const badgeStyle =
                  product.status === 'out'
                    ? 'bg-red-500/15 text-red-300 border-red-500/25'
                    : product.status === 'low'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'

                const badgeLabel =
                  product.status === 'out' ? 'Het hang'
                    : product.status === 'low' ? 'Sap het'
                      : 'Dang ban'

                return (
                  <article
                    key={product.id}
                    id={`product-${product.id}`}
                    className="grid gap-6 px-6 py-5 xl:grid-cols-[1fr_380px]"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                          />
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-base font-bold text-white">{product.name}</h3>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeStyle}`}>
                              {badgeLabel}
                            </span>
                            <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[10px] text-brand-muted">
                              #{product.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-widest text-brand-muted">Gia ban</div>
                          <div className="mt-1 text-sm font-bold text-brand-orange">{formatCurrency(product.price)}</div>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-widest text-brand-muted">Ton kho</div>
                          <div className={`mt-1 text-sm font-bold ${product.stock === 0 ? 'text-red-400' : product.stock <= LOW_STOCK_THRESHOLD ? 'text-amber-400' : 'text-white'}`}>
                            {product.stock} sp
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-widest text-brand-muted">Ngay tao</div>
                          <div className="mt-1 text-sm font-bold text-white">{formatDate(product.created_at)}</div>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-widest text-brand-muted">Hinh anh</div>
                          <div className="mt-1 text-sm text-brand-muted">
                            {product.image_url ? '✓ Co anh' : '✗ Chua co'}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                        <div className="text-[10px] uppercase tracking-widest text-brand-muted">Mo ta</div>
                        <p className="mt-1 text-sm leading-5 text-white/70">
                          {product.description || 'Chua co mo ta.'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                          <span className="text-sm font-semibold text-white">Chinh sua san pham</span>
                          <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-brand-muted group-open:bg-brand-orange/10 group-open:text-brand-orange transition">
                            Mo / Dong
                          </span>
                        </summary>

                        <div className="border-t border-white/8 px-4 pb-4 pt-4">
                          <form action={updateProduct.bind(null, product.id)} className="grid gap-3">
                            <label className="grid gap-1 text-xs">
                              <span className="text-brand-muted">Ten san pham</span>
                              <input
                                name="name"
                                defaultValue={product.name}
                                required
                                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-orange"
                              />
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                              <label className="grid gap-1 text-xs">
                                <span className="text-brand-muted">Gia (VND)</span>
                                <input
                                  name="price"
                                  type="number"
                                  min="0"
                                  step="1000"
                                  defaultValue={product.price}
                                  required
                                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-orange"
                                />
                              </label>
                              <label className="grid gap-1 text-xs">
                                <span className="text-brand-muted">Ton kho</span>
                                <input
                                  name="stock"
                                  type="number"
                                  min="0"
                                  step="1"
                                  defaultValue={product.stock}
                                  required
                                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-orange"
                                />
                              </label>
                            </div>

                            <label className="grid gap-1 text-xs">
                              <span className="text-brand-muted">URL hinh anh</span>
                              <input
                                name="image_url"
                                defaultValue={product.image_url ?? ''}
                                placeholder="https://..."
                                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-orange"
                              />
                            </label>

                            <label className="grid gap-1 text-xs">
                              <span className="text-brand-muted">Mo ta</span>
                              <textarea
                                name="description"
                                rows={3}
                                defaultValue={product.description ?? ''}
                                className="resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-orange"
                              />
                            </label>

                            <div className="flex gap-2 pt-1">
                              <button
                                type="submit"
                                className="flex-1 rounded-xl bg-brand-orange px-3 py-2.5 text-xs font-bold text-black transition hover:opacity-90"
                              >
                                Luu cap nhat
                              </button>
                              <button
                                type="submit"
                                formAction={removeProduct.bind(null, product.id)}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                              >
                                Xoa
                              </button>
                            </div>
                          </form>
                        </div>
                      </details>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-brand-muted text-sm">Chua co san pham nao. Hay them mat hang dau tien.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}