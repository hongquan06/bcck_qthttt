import { useEffect, useState } from "react";
import { Product } from "@/types";
import { DBProduct } from "@/types/db";  // ✅ thêm

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then((data: DBProduct[]) => {  // ✅ thay any → DBProduct[]
        const mapped = data.map((p) => ({  // ✅ bỏ any ở đây
          id: p.id,
          name: p.name,
          price: Number(p.price),
          originalPrice: Number(p.price),
          discount: 0,
          image: p.image_url ?? "",
          category: "Sản phẩm",
          description: p.description ?? "",
          stock: p.stock ?? 0,
        }));
        setProducts(mapped);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}