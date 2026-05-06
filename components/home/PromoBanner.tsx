import { CreditCard, Truck, RotateCcw, Headphones } from 'lucide-react'

const promos = [
  { icon: CreditCard, title: 'Trả góp 0%', desc: 'Lãi suất 0% đến 12 tháng', color: '#60A5FA' },
  { icon: Truck, title: 'Giao hàng 2H', desc: 'Miễn phí nội thành HN, HCM', color: '#34D399' },
  { icon: RotateCcw, title: 'Đổi trả 15 ngày', desc: 'Không cần lý do, miễn phí', color: '#F59E0B' },
  { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Tư vấn kỹ thuật miễn phí', color: '#A78BFA' },
]

export default function PromoBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {promos.map(({ icon: Icon, title, desc, color }) => (
          <div key={title}
            className="relative group flex items-center gap-3 p-4 rounded-2xl bg-brand-dark-2 border border-white/5 hover:border-white/10 overflow-hidden transition-all cursor-pointer">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `radial-gradient(ellipse at left, ${color}10 0%, transparent 70%)` }} />
            <div className="relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="relative min-w-0">
              <div className="text-sm font-semibold text-white truncate">{title}</div>
              <div className="text-xs text-brand-muted truncate">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
