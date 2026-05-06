import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroBanner from '@/components/home/HeroBanner'
import CategoryGrid from '@/components/home/CategoryGrid'
import FlashSale from '@/components/home/FlashSale'
import BestSeller from '@/components/home/BestSeller'
import PromoBanner from '@/components/home/PromoBanner'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-dark">
      <Header />
      <main>
        <HeroBanner />
        <PromoBanner />
        <CategoryGrid />
        <FlashSale />
        <BestSeller />
      </main>
      <Footer />
    </div>
  )
}
