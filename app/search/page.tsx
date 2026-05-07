import { Suspense } from 'react'
import SearchPageContent from './SearchPageContent'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-brand-muted text-sm">Đang tải...</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}