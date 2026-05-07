'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma' // chỉnh lại path nếu khác

export async function cancelOrder(orderId: number): Promise<{ success: boolean; message: string }> {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: { status: true },
    })

    if (!order) {
      return { success: false, message: 'Không tìm thấy đơn hàng.' }
    }

    // Chỉ cho hủy khi đang ở trạng thái pending hoặc paid
    if (!['pending', 'paid'].includes(order.status ?? '')) {
      return { success: false, message: 'Đơn hàng này không thể hủy.' }
    }

    await prisma.orders.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    })

    revalidatePath('/orders') // chỉnh lại path trang lịch sử đơn hàng nếu khác

    return { success: true, message: 'Đã hủy đơn hàng thành công.' }
  } catch {
    return { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại.' }
  }
}