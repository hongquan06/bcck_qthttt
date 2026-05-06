import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'

type AdminPageProps = {
  searchParams: Promise<{
    status?: string | string[]
  }>
}

const LOW_STOCK_THRESHOLD = 5

const statusMap = {
  created: {
    title: 'Da them san pham moi',
    description: 'San pham vua duoc dua len gian hang va se hien thi sau khi tai lai trang.',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  },
  updated: {
    title: 'Da cap nhat san pham',
    description: 'Thong tin gia, ton kho va mo ta da duoc luu thanh cong.',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  },
  removed: {
    title: 'Da go san pham khoi gian hang',
    description: 'San pham het hang hoac khong con kinh doanh da duoc xoa khoi danh muc.',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  },
  invalid: {
    title: 'Du lieu chua hop le',
    description: 'Hay kiem tra lai ten, gia ban va ton kho truoc khi gui.',
    className: 'border-red-500/30 bg-red-500/10 text-red-200',
  },
} as const

function getFirstValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value)
  return normalized.length > 0 ? normalized : null
}

function parseCurrencyValue(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value).replace(/\./g, '').replace(/,/g, '.')
  const parsed = Number(normalized)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

function parseStockValue(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value)
  const parsed = Number(normalized)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

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
  if (!date) {
    return 'Chua co du lieu'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

async function createProduct(formData: FormData) {
  'use server'

  const name = normalizeText(formData.get('name'))
  const description = normalizeOptionalText(formData.get('description'))
  const imageUrl = normalizeOptionalText(formData.get('image_url'))
  const price = parseCurrencyValue(formData.get('price'))
  const stock = parseStockValue(formData.get('stock'))

  if (!name || price === null || stock === null) {
    redirect('/admin?status=invalid')
  }

  await prisma.products.create({
    data: {
      name,
      description,
      image_url: imageUrl,
      price,
      stock,
    },
  })

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

  if (!name || price === null || stock === null) {
    redirect('/admin?status=invalid')
  }

  await prisma.products.update({
    where: { id: productId },
    data: {
      name,
      description,
      image_url: imageUrl,
      price,
      stock,
    },
  })

  revalidatePath('/admin')
  redirect('/admin?status=updated')
}

async function removeProduct(productId: number) {
  'use server'

  await prisma.products.delete({
    where: { id: productId },
  })

  revalidatePath('/admin')
  redirect('/admin?status=removed')
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await connection()

  const resolvedSearchParams = await searchParams
  const statusKey = getFirstValue(resolvedSearchParams.status)
  const statusMessage = statusKey ? statusMap[statusKey as keyof typeof statusMap] : null

  const products = await prisma.products.findMany({
    orderBy: [{ stock: 'asc' }, { created_at: 'desc' }],
  })

  const inventory = products.map((product) => {
    const stock = product.stock ?? 0
    const price = Number(product.price)

    return {
      ...product,
      stock,
      price,
      status:
        stock <= 0
          ? 'out'
          : stock <= LOW_STOCK_THRESHOLD
            ? 'low'
            : 'active',
    }
  })

  const totalProducts = inventory.length
  const outOfStockProducts = inventory.filter((product) => product.stock <= 0)
  const lowStockProducts = inventory.filter(
    (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
  )
  const activeProducts = inventory.filter((product) => product.stock > LOW_STOCK_THRESHOLD)
  const totalUnits = inventory.reduce((sum, product) => sum + product.stock, 0)

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,0,0.22),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 sm:p-8">
          <div className="noise absolute inset-0 opacity-80" />
          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 inline-flex rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-orange">
                  Admin Inventory Control
                </p>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Quan tri hang hoa cho FPT Shop
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted sm:text-base">
                  Trang nay giup admin theo doi san pham sap het hang, go san pham khong con kinh doanh,
                  them mat hang moi va cap nhat gia ban, ton kho, mo ta ngay tren he thong.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Tong SKU</div>
                  <div className="mt-2 font-display text-2xl font-bold text-white">{totalProducts}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Dang on dinh</div>
                  <div className="mt-2 font-display text-2xl font-bold text-emerald-300">{activeProducts.length}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Sap het</div>
                  <div className="mt-2 font-display text-2xl font-bold text-amber-300">{lowStockProducts.length}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Tong ton</div>
                  <div className="mt-2 font-display text-2xl font-bold text-white">{totalUnits}</div>
                </div>
              </div>
            </div>

            {statusMessage ? (
              <div className={`rounded-2xl border px-4 py-3 text-sm ${statusMessage.className}`}>
                <div className="font-semibold">{statusMessage.title}</div>
                <div className="mt-1 opacity-85">{statusMessage.description}</div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-brand-dark-2 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Can xu ly ngay</h2>
                <p className="mt-2 text-sm text-brand-muted">
                  Tap trung vao cac mat hang het hoac sap het de tranh anh huong doanh thu.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-muted">
                Nguong canh bao: {LOW_STOCK_THRESHOLD}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-red-200">San pham het hang</h3>
                  <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-200">
                    {outOfStockProducts.length} muc
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {outOfStockProducts.length > 0 ? (
                    outOfStockProducts.map((product) => (
                      <a
                        key={product.id}
                        href={`#product-${product.id}`}
                        className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-red-400/40 hover:bg-white/[0.03]"
                      >
                        <div className="font-semibold text-white">{product.name}</div>
                        <div className="mt-1 text-sm text-brand-muted">
                          Ton kho: {product.stock} - Gia: {formatCurrency(product.price)}
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-brand-muted">
                      Chua co san pham het hang. Kho dang duoc duy tri tot.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-amber-100">San pham sap het</h3>
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">
                    {lowStockProducts.length} muc
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product) => (
                      <a
                        key={product.id}
                        href={`#product-${product.id}`}
                        className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-amber-400/40 hover:bg-white/[0.03]"
                      >
                        <div className="font-semibold text-white">{product.name}</div>
                        <div className="mt-1 text-sm text-brand-muted">
                          Con {product.stock} san pham - Gia: {formatCurrency(product.price)}
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-brand-muted">
                      Khong co san pham nao o muc canh bao ton kho.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-[28px] border border-white/10 bg-brand-dark-2 p-6">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-white">Them san pham moi</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Dung form nay de dua mat hang moi len website, dat gia ban, ton kho ban dau va mo ta ngan cho trang chi tiet.
              </p>
            </div>

            <form action={createProduct} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="text-brand-muted">Ten san pham</span>
                  <input
                    name="name"
                    required
                    placeholder="Vi du: iPhone 16 128GB"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-brand-muted">Gia ban (VND)</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1000"
                    required
                    placeholder="24990000"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="text-brand-muted">Ton kho ban dau</span>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="20"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-brand-muted">Hinh anh (URL)</span>
                  <input
                    name="image_url"
                    placeholder="https://..."
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm">
                <span className="text-brand-muted">Mo ta san pham</span>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Mo ta noi bat, cau hinh, uu dai hoac ly do nen mua..."
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                />
              </label>

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-brand-orange px-4 py-3 text-sm font-bold text-black transition hover:opacity-90"
              >
                Dang san pham moi
              </button>
            </form>
          </section>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-brand-dark-2 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Danh sach hang hoa</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Moi san pham deu co khu vuc cap nhat rieng de sua gia, ton kho, mo ta va go khoi gian hang khi can.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-muted">
              {inventory.length} san pham
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {inventory.length > 0 ? (
              inventory.map((product) => {
                const badge =
                  product.status === 'out'
                    ? 'bg-red-500/15 text-red-200 border-red-500/20'
                    : product.status === 'low'
                      ? 'bg-amber-500/15 text-amber-100 border-amber-500/20'
                      : 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20'

                const badgeLabel =
                  product.status === 'out'
                    ? 'Het hang'
                    : product.status === 'low'
                      ? 'Sap het'
                      : 'Dang ban'

                return (
                  <article
                    key={product.id}
                    id={`product-${product.id}`}
                    className="rounded-[26px] border border-white/10 bg-black/15 p-5"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-xl font-bold text-white">{product.name}</h3>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}>
                            {badgeLabel}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-brand-muted">
                            Ma SP #{product.id}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Gia ban</div>
                            <div className="mt-2 text-lg font-bold text-brand-orange">{formatCurrency(product.price)}</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Ton kho</div>
                            <div className="mt-2 text-lg font-bold text-white">{product.stock} san pham</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Ngay tao</div>
                            <div className="mt-2 text-lg font-bold text-white">{formatDate(product.created_at)}</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Hinh anh</div>
                            <div className="mt-2 truncate text-sm text-brand-muted">
                              {product.image_url ? 'Da gan URL anh' : 'Chua co anh'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Mo ta hien tai</div>
                          <p className="mt-2 text-sm leading-6 text-brand-text/90">
                            {product.description || 'San pham nay chua co mo ta. Admin nen bo sung de tang ty le chuyen doi.'}
                          </p>
                        </div>
                      </div>

                      <div className="w-full xl:max-w-[420px]">
                        <details className="group rounded-[24px] border border-white/10 bg-brand-dark-3 p-5">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                            <div>
                              <div className="font-semibold text-white">Cap nhat san pham</div>
                              <div className="mt-1 text-sm text-brand-muted">
                                Sua gia, ton kho, mo ta va URL hinh anh ngay tai day.
                              </div>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-brand-muted">
                              Mo
                            </span>
                          </summary>

                          <form action={updateProduct.bind(null, product.id)} className="mt-5 grid gap-4">
                            <label className="grid gap-2 text-sm">
                              <span className="text-brand-muted">Ten san pham</span>
                              <input
                                name="name"
                                defaultValue={product.name}
                                required
                                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                              />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="grid gap-2 text-sm">
                                <span className="text-brand-muted">Gia ban (VND)</span>
                                <input
                                  name="price"
                                  type="number"
                                  min="0"
                                  step="1000"
                                  defaultValue={product.price}
                                  required
                                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                                />
                              </label>

                              <label className="grid gap-2 text-sm">
                                <span className="text-brand-muted">Ton kho</span>
                                <input
                                  name="stock"
                                  type="number"
                                  min="0"
                                  step="1"
                                  defaultValue={product.stock}
                                  required
                                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                                />
                              </label>
                            </div>

                            <label className="grid gap-2 text-sm">
                              <span className="text-brand-muted">URL hinh anh</span>
                              <input
                                name="image_url"
                                defaultValue={product.image_url ?? ''}
                                placeholder="https://..."
                                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                              />
                            </label>

                            <label className="grid gap-2 text-sm">
                              <span className="text-brand-muted">Mo ta</span>
                              <textarea
                                name="description"
                                rows={4}
                                defaultValue={product.description ?? ''}
                                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand-orange"
                              />
                            </label>

                            <div className="flex flex-col gap-3 sm:flex-row">
                              <button
                                type="submit"
                                className="flex-1 rounded-2xl bg-brand-orange px-4 py-3 text-sm font-bold text-black transition hover:opacity-90"
                              >
                                Luu cap nhat
                              </button>
                              <button
                                type="submit"
                                formAction={removeProduct.bind(null, product.id)}
                                className="flex-1 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
                              >
                                Go khoi gian hang
                              </button>
                            </div>
                          </form>
                        </details>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-12 text-center text-brand-muted">
                Chua co san pham nao trong he thong. Hay them mat hang dau tien bang form o phia tren.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
