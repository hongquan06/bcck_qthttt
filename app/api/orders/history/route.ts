import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);

    if (!userId || isNaN(userId)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    return Response.json(orders);
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}