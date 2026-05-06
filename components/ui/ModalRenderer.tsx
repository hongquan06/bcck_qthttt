// components/ui/ModalRenderer.tsx
'use client'

import { useProductModal } from '@/lib/ProductModalContext'
import ProductModal from './ProductModal'

export default function ModalRenderer() {
  const { selectedProduct, closeModal } = useProductModal()
  return <ProductModal product={selectedProduct} onClose={closeModal} />
}