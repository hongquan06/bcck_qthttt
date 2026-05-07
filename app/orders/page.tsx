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

  const orders = await prisma.orders.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    include: {
      order_items: {
        include: { products: true },
      },
    },
  });

  return <OrderHistory orders={orders} />;
}