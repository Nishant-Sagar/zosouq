import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Package, Truck, Shield, Clock, ChevronRight } from 'lucide-react'
import { getCategories } from '../api'

/* ─── Visual config per category ─── */
const CAT_CONFIG = {
  'perfumes': {
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    lightGradient: 'from-violet-50 to-purple-50',
    img: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&fit=crop',
    desc: 'Discover luxury Arabian oud, designer fragrances & niche perfumes from world-renowned brands.',
    tags: ['Oud', 'Floral', 'Woody', 'Fresh', 'Oriental', 'Musky'],
    subCategories: [
      { name: 'Arabian Oud', img: 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?w=800&fit=crop' },
      { name: 'Designer', img: 'https://images.unsplash.com/photo-1595535873420-a599195b3f4a?w=800&fit=crop' },
    ],
  },
  'makeup': {
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    lightGradient: 'from-pink-50 to-rose-50',
    img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&fit=crop',
    desc: 'Premium foundations, lipsticks, eyeshadows & more to create your perfect look.',
    tags: ['Lipstick', 'Foundation', 'Eyeshadow', 'Mascara', 'Blush', 'Primer'],
    subCategories: [
      { name: 'Face', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&fit=crop' },
      { name: 'Lips', img: 'https://images.unsplash.com/photo-1586495777744-4e6232bf8dea?w=800&fit=crop' },
    ],
  },
  'hair-care': {
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    lightGradient: 'from-amber-50 to-orange-50',
    img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&fit=crop',
    desc: 'Professional-grade shampoos, serums, masks & styling products for every hair type.',
    tags: ['Shampoo', 'Conditioner', 'Hair Mask', 'Serum', 'Oil', 'Styling'],
    subCategories: [
      { name: 'Treatment', img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&fit=crop' },
      { name: 'Styling', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&fit=crop' },
    ],
  },
  'body-care': {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    lightGradient: 'from-emerald-50 to-teal-50',
    img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&fit=crop',
    desc: 'Indulge in spa-quality body lotions, scrubs, creams & luxurious body treatments.',
    tags: ['Lotion', 'Scrub', 'Body Wash', 'Cream', 'Butter', 'Mist'],
    subCategories: [
      { name: 'Spa', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&fit=crop' },
      { name: 'Summer', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&fit=crop' },
    ],
  },
  'personal-care': {
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    lightGradient: 'from-blue-50 to-indigo-50',
    img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&fit=crop',
    desc: 'Daily essentials including cleansers, moisturizers, sunscreens & skincare routines.',
    tags: ['Cleanser', 'Moisturizer', 'Serum', 'Sunscreen', 'Deodorant', 'Soap'],
    subCategories: [
      { name: 'Daily', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&fit=crop' },
      { name: 'Skincare', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&fit=crop' },
    ],
  },
}

const DEFAULT_CONFIG = {
  gradient: 'from-gray-500 to-gray-700',
  lightGradient: 'from-gray-50 to-gray-100',
  img: '',
  desc: 'Explore our collection',
  tags: [],
  subCategories: [],
}

/* ─── Trust / Perks ─── */
const PERKS = [
  { icon: Truck, title: 'Free Delivery', desc: 'All across Kuwait', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Shield, title: '100% Authentic', desc: 'Guaranteed genuine', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Clock, title: 'Next Day', desc: 'Fast delivery', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Package, title: '4,400+ Products', desc: 'Huge selection', color: 'text-purple-600', bg: 'bg-purple-50' },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ════════════════════════════════════════════════
          HERO POSTER
          ════════════════════════════════════════════════ */}
      <section className="py-4 sm:py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden group" style={{ minHeight: 'clamp(220px, 35vw, 340px)' }}>
            <img src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=1200&fit=crop" alt="Shop by Category"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-gray-950/30" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-6 sm:px-12 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4 border border-white/10">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {categories.length || 5} Categories &middot; 4,400+ Products
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  Shop by Category
                </h1>
                <p className="text-white/60 text-xs sm:text-sm max-w-md">
                  From luxurious perfumes to everyday essentials — find exactly what you need, beautifully curated for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CATEGORY CARDS — Large alternating layout
          ════════════════════════════════════════════════ */}
      <section className="py-8 sm:py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="space-y-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-gray-100 h-64" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {categories.map((cat, idx) => {
                const cfg = CAT_CONFIG[cat.slug] || DEFAULT_CONFIG
                const count = cat.product_count || 0
                const isEven = idx % 2 === 0

                return (
                  <div key={cat.id}
                    className={`group rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/80 border border-gray-100 bg-gradient-to-br ${cfg.lightGradient}`}>
                    <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>

                      {/* Image side */}
                      <div className="relative lg:w-[45%] overflow-hidden">
                        <Link to={`/category/${cat.slug}`} className="block">
                          <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[380px]">
                            <img src={cfg.img} alt={cat.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${cfg.gradient} opacity-40 group-hover:opacity-30 transition-opacity duration-500`} />

                            {/* Floating product count badge */}
                            {count > 0 && (
                              <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg text-sm font-bold text-gray-900">
                                  <Package className="w-3.5 h-3.5" />
                                  {count.toLocaleString()}+ Products
                                </div>
                              </div>
                            )}

                            {/* Sub-category thumbnails */}
                            {cfg.subCategories.length > 0 && (
                              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 flex gap-2">
                                {cfg.subCategories.map(sub => (
                                  <div key={sub.name}
                                    className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg">
                                    <img src={sub.img} alt={sub.name}
                                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-800">{sub.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>

                      {/* Content side */}
                      <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg`}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                            {cat.name}
                          </h2>
                        </div>

                        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-5 max-w-md">
                          {cfg.desc}
                        </p>

                        {/* Tag chips — single scrollable row on mobile */}
                        {cfg.tags.length > 0 && (
                          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                            {cfg.tags.slice(0, 4).map(tag => (
                              <span key={tag}
                                className="px-3 py-1.5 rounded-lg bg-white text-xs sm:text-sm font-medium text-gray-600 border border-gray-200 whitespace-nowrap flex-shrink-0">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* CTA */}
                        <div className="flex items-center gap-3">
                          <Link to={`/category/${cat.slug}`}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:gap-3 active:scale-95`}>
                            Browse {cat.name} <ArrowRight className="w-4 h-4" />
                          </Link>
                          {count > 0 && (
                            <span className="text-xs text-gray-400 hidden sm:inline">
                              {count.toLocaleString()} products available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          QUICK BROWSE — Compact visual grid
          ════════════════════════════════════════════════ */}
      <section className="py-8 sm:py-12 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quick Browse</h2>
            <p className="text-gray-500 text-sm mt-1">Jump straight to what you need</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map(cat => {
              const cfg = CAT_CONFIG[cat.slug] || DEFAULT_CONFIG
              const count = cat.product_count || 0
              return (
                <Link key={cat.id} to={`/category/${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] flex flex-col justify-end shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <img src={cfg.img} alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cfg.gradient} opacity-60 group-hover:opacity-50 transition-opacity`} />
                  <div className="relative z-10 p-4 sm:p-5">
                    <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-md">{cat.name}</h3>
                    {count > 0 && (
                      <p className="text-white/60 text-[11px] sm:text-xs mt-0.5">{count.toLocaleString()} products</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-white text-[11px] sm:text-xs font-medium mt-2.5 group-hover:gap-2 transition-all bg-white/20 backdrop-blur-sm px-2.5 py-1.5 rounded-lg">
                      Shop <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TRUST SECTION
          ════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="rounded-2xl sm:rounded-3xl bg-gray-950 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5" />
            <div className="relative z-10 p-8 sm:p-12 lg:p-16">
              <div className="text-center mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Why Shop with Zosouq?</h2>
                <p className="text-gray-500 text-sm mt-2">Trusted by thousands of customers across Kuwait</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {PERKS.map(p => (
                  <div key={p.title}
                    className="flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center mb-3`}>
                      <p.icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <h3 className="text-white font-semibold text-sm">{p.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
