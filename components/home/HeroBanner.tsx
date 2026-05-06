'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight, Shield, Truck, CreditCard } from 'lucide-react'

const slides = [
  {
    id: 0,
    eyebrow: '🔥 Siêu ưu đãi hôm nay',
    title: 'MEGA TECH',
    title2: 'SALE',
    subtitle: 'Giảm đến',
    discount: '50%',
    desc: 'Điện thoại, laptop, đồng hồ thông minh — Hàng chính hãng, giá cực hời',
    cta: 'Mua ngay',
    ctaSecondary: 'Xem tất cả',
    accent: '#FF6B00',
    tag: 'FLASH DEAL',
  },
  {
    id: 1,
    eyebrow: '✦ Mới ra mắt',
    title: 'iPHONE 15',
    title2: 'PRO MAX',
    subtitle: 'Chỉ từ',
    discount: '28.99M',
    desc: 'Chip A17 Pro, camera 48MP, thiết kế titanium cao cấp. Giao hàng trong 2 giờ.',
    cta: 'Khám phá',
    ctaSecondary: 'So sánh giá',
    accent: '#60A5FA',
    tag: 'MỚI 2024',
  },
]

const trustItems = [
  { icon: CreditCard, label: 'Trả góp 0%', sub: '12 tháng' },
  { icon: Truck, label: 'Giao hàng 2H', sub: 'Nội thành' },
  { icon: Shield, label: 'Bảo hành', sub: 'Chính hãng' },
]

export default function HeroBanner() {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)

  // ✅ Khai báo goTo TRƯỚC useEffect
  const goTo = (idx: number) => {
    if (animating) return
    setAnimating(true)
    setActive(idx)
    setTimeout(() => setAnimating(false), 600)
  }

  useEffect(() => {
    const timer = setInterval(() => goTo((active + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [active])


  const slide = slides[active]

  return (
    <section className="relative overflow-hidden bg-brand-dark min-h-[480px] lg:min-h-[520px]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 transition-all duration-1000"
          style={{ background: `radial-gradient(ellipse 80% 80% at 70% 50%, ${slide.accent}18 0%, transparent 70%)` }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        <div className="absolute right-[20%] top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 transition-colors duration-1000"
          style={{ background: slide.accent }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="flex items-center gap-8 lg:gap-16">
          {/* Content */}
          <div className={`flex-1 transition-all duration-500 ${animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest"
                style={{ background: `${slide.accent}20`, color: slide.accent, border: `1px solid ${slide.accent}30` }}>
                {slide.tag}
              </span>
              <span className="text-brand-muted text-sm">{slide.eyebrow}</span>
            </div>

            <div className="font-display mb-2">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tighter">
                {slide.title}
              </div>
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tighter"
                style={{ color: slide.accent }}>
                {slide.title2}
              </div>
            </div>

            <div className="flex items-baseline gap-3 my-5">
              <span className="text-brand-muted text-lg">{slide.subtitle}</span>
              <span className="font-display text-5xl font-black"
                style={{ color: slide.accent, textShadow: `0 0 40px ${slide.accent}60` }}>
                {slide.discount}
              </span>
            </div>

            <p className="text-brand-muted text-sm sm:text-base leading-relaxed max-w-md mb-8">
              {slide.desc}
            </p>

            <div className="flex items-center gap-3">
              <button className="group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-black text-sm transition-all duration-200 hover:gap-3"
                style={{ background: slide.accent, boxShadow: `0 8px 24px ${slide.accent}40` }}>
                {slide.cta}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-brand-muted hover:text-white border border-white/10 hover:border-white/20 transition-all">
                {slide.ctaSecondary}
              </button>
            </div>
          </div>

          {/* Visual badge */}
          <div className={`hidden lg:flex flex-col items-center justify-center relative transition-all duration-500 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '20s' }} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="95" fill="none" stroke={slide.accent} strokeWidth="1" strokeDasharray="6 14" opacity="0.3" />
              </svg>
              <div className="w-44 h-44 rounded-full flex flex-col items-center justify-center"
                style={{ background: `radial-gradient(circle, ${slide.accent}20 0%, ${slide.accent}08 100%)`, border: `2px solid ${slide.accent}30` }}>
                <div className="text-[11px] font-semibold text-brand-muted tracking-widest uppercase">Giảm tới</div>
                <div className="font-display text-6xl font-black leading-none" style={{ color: slide.accent }}>
                  {slide.discount.includes('%') ? slide.discount : '12%'}
                </div>
                <div className="text-[11px] font-semibold text-brand-muted mt-1">Hôm nay thôi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <button onClick={() => goTo((active - 1 + slides.length) % slides.length)}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-brand-muted hover:text-white transition-all">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => goTo((active + 1) % slides.length)}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-brand-muted hover:text-white transition-all">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-2 mt-8">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => goTo(i)}
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: active === i ? '32px' : '8px', background: active === i ? slide.accent : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div className="relative border-t border-white/5 bg-brand-dark-2/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center sm:justify-start divide-x divide-white/5 py-3">
            {trustItems.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2 px-4 sm:px-6 first:pl-0">
                <div className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                  <Icon size={14} className="text-brand-orange" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{label}</div>
                  <div className="text-[10px] text-brand-muted">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
