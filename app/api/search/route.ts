// app/api/search/route.ts
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (!q) {
      return Response.json([]);
    }

    const products = await prisma.products.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20, // tối đa 20 kết quả
    });

    return Response.json(products);
  } catch (error) {
    console.error(error);
    return new Response("Search failed", { status: 500 });
  }
}