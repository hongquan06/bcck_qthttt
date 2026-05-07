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
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 20,
    });

    return Response.json(products);
  } catch (error) {
    console.error(error);
    return new Response("Search failed", { status: 500 });
  }
}