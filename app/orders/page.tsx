import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrderHistory from "@/components/ui/OrderHistory";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!userId || isNaN(userId)) {
    redirect("/auth/login");
  }

  const rawOrders = await prisma.orders.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    include: {
      order_items: {
        include: { products: true },
      },
    },
  });

  // Convert Decimal → number để serialize an toàn xuống Client Component
  const orders = rawOrders.map((order) => ({
    ...order,
    total_price: order.total_price ? Number(order.total_price) : null,
    order_items: order.order_items.map((item) => ({
      ...item,
      price: item.price ? Number(item.price) : null,
    })),
  }));

  return <OrderHistory orders={orders} />;
}