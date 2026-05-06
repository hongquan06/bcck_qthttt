import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = Number(session?.user?.id)

  if (!session?.user?.id || Number.isNaN(userId)) {
    return NextResponse.json({ count: 0 })
  }

  const cart = await prisma.carts.findFirst({
    where: { user_id: userId },
    include: { _count: { select: { cart_items: true } } },
  })

  return NextResponse.json({ count: cart?._count?.cart_items ?? 0 })
}