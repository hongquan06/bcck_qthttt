// lib/ProductModalContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Product } from '@/types/index'  // ← import type gốc của bạn

type ModalContextType = {
  openModal: (product: Product) => void
  closeModal: () => void
  selectedProduct: Product | null
}

const ModalContext = createContext<ModalContextType | null>(null)

export function ProductModalProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <ModalContext.Provider value={{
      openModal: setSelectedProduct,
      closeModal: () => setSelectedProduct(null),
      selectedProduct,
    }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useProductModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useProductModal must be used inside ProductModalProvider')
  return ctx
}