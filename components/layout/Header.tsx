'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingCart, User, Menu, X, Bell, ChevronDown, Zap, LogOut } from 'lucide-react'
import { navItems } from '../../lib/data'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const { data: session, status } = useSession()

  const displayCartCount = status === 'authenticated' ? cartCount : 0

  useEffect(() => {
    if (status !== 'authenticated') return

    let cancelled = false

    fetch('/api/cart/count')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!cancelled && data?.count != null) setCartCount(data.count)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [status])

  return (
    <header className="sticky top-0 z-50">
      {/* Top ticker bar */}
      <div className="bg-brand-orange overflow-hidden py-1.5">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 px-4 text-xs font-semibold text-black tracking-wide">
              <span>⚡ FLASH SALE HẰNG NGÀY — GIẢM ĐẾN 50%</span>
              <span>🚚 GIAO HÀNG 2H NỘI THÀNH</span>
              <span>💳 TRẢ GÓP 0% LÃI SUẤT</span>
              <span>🛡️ BẢO HÀNH CHÍNH HÃNG 12 THÁNG</span>
              <span>🎁 TẶNG PHỤ KIỆN TRỊ GIÁ 500K</span>
              <span className="opacity-0 select-none">spacer</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-brand-dark-2/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center font-display font-black text-black text-sm group-hover:scale-105 transition-transform">
                  FPT
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-orange rounded-full animate-pulse-dot opacity-70" />
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-bold text-white text-base leading-tight tracking-tight">TECH</div>
                <div className="text-[10px] text-brand-orange font-semibold tracking-widest leading-none">SHOP</div>
              </div>
            </Link>

            {/* Search */}
            <div className={`flex-1 max-w-xl relative transition-all duration-300 ${searchFocused ? 'max-w-2xl' : ''}`}>
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border transition-all duration-200 ${
                searchFocused
                  ? 'bg-brand-dark-3 border-brand-orange shadow-[0_0_0_3px_rgba(255,107,0,0.15)]'
                  : 'bg-brand-dark-3 border-white/10 hover:border-white/20'
              }`}>
                <Search size={16} className={`shrink-0 transition-colors ${searchFocused ? 'text-brand-orange' : 'text-brand-muted'}`} />
                <input
                  type="text"
                  placeholder="Tìm điện thoại, laptop, phụ kiện..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-1 bg-transparent text-sm text-brand-text placeholder:text-brand-muted outline-none min-w-0"
                />
                <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-brand-muted bg-white/5 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
              </div>

              {searchFocused && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-brand-dark-2 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-2 text-[11px] font-semibold text-brand-muted uppercase tracking-widest">Tìm kiếm phổ biến</div>
                  {['iPhone 15 Pro Max', 'MacBook Air M2', 'Samsung S24', 'AirPods Pro'].map(term => (
                    <div key={term} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer">
                      <Zap size={13} className="text-brand-orange" />
                      <span className="text-sm text-brand-text">{term}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 transition-all text-sm">
                <Bell size={16} />
              </button>

              {status === 'authenticated' ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 transition-all"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:block text-sm font-medium truncate max-w-[100px]">
                    {session.user?.email?.split('@')[0]}
                  </span>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 transition-all"
                >
                  <User size={18} />
                  <span className="hidden sm:block text-sm font-medium">Đăng nhập</span>
                </Link>
              )}

              <Link
                href="/cart"
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange transition-all border border-brand-orange/20"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:block text-sm font-semibold">Giỏ hàng</span>
                {displayCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-orange text-black text-[11px] font-black flex items-center justify-center">
                    {displayCartCount > 99 ? '99+' : displayCartCount}
                  </span>
                )}
              </Link>

              <button
                className="sm:hidden p-2 text-brand-muted hover:text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Category nav */}
        <div className="hidden sm:block border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center overflow-x-auto">
              {navItems.map((item) => {
                const slug = item.toLowerCase().replace(/\s+/g, '-')
                return (
                  <Link
                    key={item}
                    href={`/${slug}`}
                    className="shrink-0 px-4 py-2.5 text-sm text-brand-muted hover:text-brand-orange font-medium whitespace-nowrap transition-colors relative group"
                  >
                    {item}
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-brand-dark-2 border-t border-white/5 shadow-2xl">
          {navItems.map(item => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-3 px-6 py-3.5 text-brand-muted hover:text-white hover:bg-white/5 border-b border-white/5 text-sm"
            >
              <ChevronDown size={14} className="-rotate-90" />
              {item}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}