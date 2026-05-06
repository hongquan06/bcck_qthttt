import type { Metadata } from 'next'
import './globals.css'
import { ProductModalProvider } from '@/lib/ProductModalContext'
import ModalRenderer from '@/components/ui/ModalRenderer'
import Providers from './providers'   // 👈 thêm

export const metadata: Metadata = {
  title: 'FPT Tech Shop — Công nghệ đỉnh cao',
  description: 'Mua sắm điện thoại, laptop, tablet và phụ kiện chính hãng tại FPT Tech Shop',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>   {/* 👈 dùng ở đây */}
          <ProductModalProvider>
            {children}
            <ModalRenderer />
          </ProductModalProvider>
        </Providers>
      </body>
    </html>
  )
}