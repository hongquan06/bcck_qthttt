import { prisma } from "@/lib/prisma";
export async function GET() {
  const products = await prisma.products.findMany();
  return Response.json(products);
}