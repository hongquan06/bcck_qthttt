import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { connection } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

async function requireSessionUserId() {
  const session = await getServerSession(authOptions)
  const userId = Number(session?.user?.id)

  if (!session?.user?.id || Number.isNaN(userId)) {
    throw new Error('Unauthorized')
  }

  return userId
}

async function updateCartItemQuantity(cartItemId: number, nextQuantity: number) {
  'use server'

  const userId = await requireSessionUserId()
  const cartItem = await prisma.cart_items.findUnique({
    where: { id: cartItemId },
    include: { carts: true, products: true },
  })

  if (!cartItem || cartItem.carts?.user_id !== userId) {
    throw new Error('Forbidden')
  }

  const maxStock = cartItem.products?.stock ?? 0
  const safeQuantity = Math.min(nextQuantity, maxStock)

  if (nextQuantity < 1 || safeQuantity < 1) {
    await prisma.cart_items.delete({
      where: { id: cartItemId },
    })

    revalidatePath('/cart')
    return
  }

  await prisma.cart_items.update({
    where: { id: cartItemId },
    data: { quantity: safeQuantity },
  })

  revalidatePath('/cart')
}

async function removeCartItem(cartItemId: number) {
  'use server'

  const userId = await requireSessionUserId()
  const cartItem = await prisma.cart_items.findUnique({
    where: { id: cartItemId },
    include: { carts: true },
  })

  if (!cartItem || cartItem.carts?.user_id !== userId) {
    throw new Error('Forbidden')
  }

  await prisma.cart_items.delete({
    where: { id: cartItemId },
  })

  revalidatePath('/cart')
}

async function clearCart(cartId: number) {
  'use server'

  const userId = await requireSessionUserId()
  const cart = await prisma.carts.findUnique({
    where: { id: cartId },
  })

  if (!cart || cart.user_id !== userId) {
    throw new Error('Forbidden')
  }

  await prisma.cart_items.deleteMany({
    where: { cart_id: cartId },
  })

  revalidatePath('/cart')
}

export default async function CartPage() {
  await connection()

  const session = await getServerSession(authOptions)
  const userId = Number(session?.user?.id)

  if (!session?.user?.id || Number.isNaN(userId)) {
    return (
      <main className="min-h-screen bg-brand-dark px-4 py-10 text-white sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[32px] border border-white/10 bg-brand-dark-2 px-6 py-16 text-center">
          <span className="rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
            Gio hang
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold">Ban can dang nhap de xem gio hang</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-brand-muted sm:text-base">
            He thong se hien thi cac san pham da chon, tong tien tam tinh va nut thanh toan sau khi em dang nhap thanh cong.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="rounded-2xl bg-brand-orange px-6 py-3 text-sm font-bold text-black transition hover:opacity-90"
            >
              Dang nhap ngay
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Quay ve trang chu
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const cart = await prisma.carts.findFirst({
    where: { user_id: userId },
    include: {
      cart_items: {
        include: {
          products: true,
        },
      },
    },
  })

  const items =
    cart?.cart_items
      .filter((item) => item.products)
      .map((item) => {
        const product = item.products!
        const quantity = item.quantity ?? 0
        const price = Number(product.price)
        const stock = product.stock ?? 0

        return {
          cartItemId: item.id,
          name: product.name,
          description: product.description,
          imageUrl: product.image_url,
          price,
          stock,
          quantity,
          subtotal: price * quantity,
        }
      }) ?? []

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const shippingFee = items.length > 0 ? 30000 : 0
  const total = subtotal + shippingFee

  return (
    <main className="min-h-screen bg-brand-dark px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,0,0.2),_transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 sm:p-8">
          <div className="noise absolute inset-0 opacity-80" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
                Shopping Cart
              </span>
              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Gio hang cua ban
              </h1>
              <p className="mt-3 text-sm leading-6 text-brand-muted sm:text-base">
                Theo doi danh sach san pham da chon, dieu chinh so luong va chuyen sang buoc thanh toan ngay tren trang nay.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Mat hang</div>
                <div className="mt-2 font-display text-2xl font-bold text-white">{items.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Tam tinh</div>
                <div className="mt-2 font-display text-xl font-bold text-brand-orange">{formatCurrency(subtotal)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Tong cong</div>
                <div className="mt-2 font-display text-xl font-bold text-white">{formatCurrency(total)}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[28px] border border-white/10 bg-brand-dark-2 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Danh sach san pham</h2>
                <p className="mt-2 text-sm text-brand-muted">
                  Cap nhat so luong hoac xoa san pham khong con nhu cau truoc khi thanh toan.
                </p>
              </div>

              {cart && items.length > 0 ? (
                <form action={clearCart.bind(null, cart.id)}>
                  <button
                    type="submit"
                    className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
                  >
                    Xoa toan bo gio hang
                  </button>
                </form>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              {items.length > 0 ? (
                items.map((item) => (
                  <article
                    key={item.cartItemId}
                    className="flex flex-col gap-5 rounded-[24px] border border-white/10 bg-black/15 p-5 sm:flex-row sm:items-start"
                  >
                    <div className="h-28 w-full overflow-hidden rounded-2xl border border-white/10 bg-brand-dark-3 sm:w-28 sm:min-w-28">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-brand-muted">
                          Chua co anh
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3 className="font-display text-xl font-bold text-white">{item.name}</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
                            {item.description || 'San pham nay chua co mo ta chi tiet.'}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
                          <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Thanh tien</div>
                          <div className="mt-2 text-lg font-bold text-brand-orange">{formatCurrency(item.subtotal)}</div>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Don gia</div>
                          <div className="mt-2 text-base font-semibold text-white">{formatCurrency(item.price)}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">Ton kho</div>
                          <div className="mt-2 text-base font-semibold text-white">{item.stock} san pham</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-brand-muted">So luong da chon</div>
                          <div className="mt-2 text-base font-semibold text-white">{item.quantity}</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <form action={updateCartItemQuantity.bind(null, item.cartItemId, item.quantity - 1)}>
                            <button
                              type="submit"
                              className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-white transition hover:bg-white/10"
                            >
                              -
                            </button>
                          </form>
                          <div className="min-w-16 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center text-sm font-semibold text-white">
                            {item.quantity}
                          </div>
                          <form action={updateCartItemQuantity.bind(null, item.cartItemId, Math.min(item.quantity + 1, item.stock))}>
                            <button
                              type="submit"
                              disabled={item.quantity >= item.stock}
                              className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </form>
                        </div>

                        <form action={removeCartItem.bind(null, item.cartItemId)}>
                          <button
                            type="submit"
                            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
                          >
                            Xoa khoi gio hang
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-14 text-center">
                  <h3 className="font-display text-2xl font-bold text-white">Gio hang dang trong</h3>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-brand-muted">
                    Em chua co san pham nao trong gio hang. Hay quay ve trang chu, chon san pham va them vao gio de tiep tuc.
                  </p>
                  <Link
                    href="/"
                    className="mt-6 inline-flex rounded-2xl bg-brand-orange px-5 py-3 text-sm font-bold text-black transition hover:opacity-90"
                  >
                    Tiep tuc mua sam
                  </Link>
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-brand-dark-2 p-6">
            <h2 className="font-display text-2xl font-bold text-white">Tom tat don hang</h2>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              Day la khu vuc xac nhan tong tien truoc khi chuyen sang trang thanh toan.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <span className="text-sm text-brand-muted">Tam tinh</span>
                <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <span className="text-sm text-brand-muted">Phi giao hang</span>
                <span className="font-semibold text-white">{formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-brand-orange/20 bg-brand-orange/10 px-4 py-4">
                <span className="text-sm font-semibold text-brand-orange">Tong thanh toan</span>
                <span className="font-display text-xl font-bold text-white">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="text-sm font-semibold text-white">Luu y demo</div>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Nut thanh toan se dua em sang trang PayPal mock cua du an de mo phong buoc checkout cuoi cung.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={items.length > 0 ? '/payment' : '/cart'}
                className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition ${
                  items.length > 0
                    ? 'bg-brand-orange text-black hover:opacity-90'
                    : 'pointer-events-none bg-white/10 text-brand-muted'
                }`}
              >
                Thanh toan ngay
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Tiep tuc mua sam
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
