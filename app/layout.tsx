import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FPT Tech Shop — Công nghệ đỉnh cao',
  description: 'Mua sắm điện thoại, laptop, tablet và phụ kiện chính hãng tại FPT Tech Shop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
