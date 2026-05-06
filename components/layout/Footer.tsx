import { MapPin, Phone, Mail } from 'lucide-react'

const footerLinks = {
  'Sản phẩm': ['Điện thoại', 'Laptop', 'Tablet', 'Đồng hồ', 'Phụ kiện', 'Gia dụng'],
  'Hỗ trợ': ['Hướng dẫn mua hàng', 'Tra cứu đơn hàng', 'Chính sách đổi trả', 'Bảo hành', 'Thanh toán'],
  'Về FPT Tech': ['Giới thiệu', 'Hệ thống cửa hàng', 'Tuyển dụng', 'Tin tức', 'Liên hệ'],
}

const socialIcons = [
  {
    label: 'Facebook',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Youtube',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="#0F0F0F" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-brand-dark-2 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center font-display font-black text-black">
                FPT
              </div>
              <div>
                <div className="font-display font-bold text-white text-lg leading-tight">TECH SHOP</div>
                <div className="text-[10px] text-brand-orange font-semibold tracking-widest">CÔNG NGHỆ ĐỈNH CAO</div>
              </div>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed mb-5 max-w-xs">
              Hệ thống bán lẻ điện thoại, laptop, thiết bị công nghệ hàng đầu Việt Nam với 600+ cửa hàng toàn quốc.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <MapPin size={13} className="text-brand-orange shrink-0" />261 Cầu Giấy, Hà Nội
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <Phone size={13} className="text-brand-orange shrink-0" />1800 6601 (Miễn phí)
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <Mail size={13} className="text-brand-orange shrink-0" />support@fptshop.com.vn
              </div>
            </div>

            {/* Social icons */}
            <div className="flex gap-2 mt-5">
              {socialIcons.map(({ label, href, svg }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-brand-dark-3 border border-white/5 hover:border-brand-orange/30 hover:bg-brand-orange/10 flex items-center justify-center text-brand-muted hover:text-brand-orange transition-all"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-bold text-white text-sm mb-4 uppercase tracking-wide">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-xs text-brand-muted hover:text-brand-orange transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-muted">© 2024 FPT Tech Shop. Giấy phép ĐKKD số 0101248141.</p>
          <div className="flex gap-4 text-xs text-brand-muted">
            <a href="#" className="hover:text-brand-orange transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-brand-orange transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-brand-orange transition-colors">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  )
}