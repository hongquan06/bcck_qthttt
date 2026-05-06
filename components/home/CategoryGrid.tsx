import { categories } from '../../lib/data'

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-brand-orange rounded-full" />
        <h2 className="font-display font-bold text-white text-sm uppercase tracking-widest">Danh mục sản phẩm</h2>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
        {categories.map((cat, i) => (
          <a
            key={cat.id}
            href={`/${cat.slug}`}
            className="cat-icon group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-brand-dark-2 hover:bg-brand-dark-3 border border-white/5 hover:border-brand-orange/30 transition-all duration-200 cursor-pointer"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-brand-dark-3 group-hover:bg-brand-orange/10 flex items-center justify-center transition-all duration-200 border border-white/5 group-hover:border-brand-orange/20">
              <span className="cat-icon-img text-2xl sm:text-3xl transition-all duration-200">
                {cat.icon}
              </span>
              {cat.slug === 'sale' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-orange rounded-full animate-pulse-dot" />
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-brand-muted group-hover:text-white transition-colors text-center leading-tight">
              {cat.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
