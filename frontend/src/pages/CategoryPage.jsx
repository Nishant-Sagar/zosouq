import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SlidersHorizontal, ChevronDown, X, Sparkles, ArrowRight, Star } from 'lucide-react'
import { getCategory, getProducts } from '../api'
import ProductCard from '../components/ProductCard'

/* ── Category visual themes ── */
const CATEGORY_THEMES = {
  perfumes: {
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    overlayGradient: 'from-violet-950/90 via-violet-950/60 to-violet-950/30',
    lightBg: 'from-violet-50 via-purple-50 to-fuchsia-50',
    accent: 'violet',
    accentColor: '#7c3aed',
    poster: '/images/poster-perfumes.webp',
    tagline: 'Your Signature Awaits',
    description: 'Discover authentic Arabian ouds & international designer fragrances, all under one roof.',
    promos: [
      { title: 'Arabian Oud Collection', sub: 'Exclusive fragrances from the finest oud', img: '/images/arabian-oud.webp', gradient: 'from-violet-700 to-purple-900' },
      { title: 'Designer Perfumes', sub: 'Up to 60% less than retail', img: '/images/designer-perfumes.webp', gradient: 'from-fuchsia-600 to-pink-800' },
    ],
    chips: ['Oud', 'Floral', 'Woody', 'Fresh', 'Oriental', 'Citrus'],
  },
  makeup: {
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    overlayGradient: 'from-rose-950/90 via-rose-950/60 to-rose-950/30',
    lightBg: 'from-pink-50 via-rose-50 to-red-50',
    accent: 'pink',
    accentColor: '#ec4899',
    poster: '/images/poster-makeup.webp',
    tagline: 'Glow Like Never Before',
    description: 'Premium foundations, lipsticks, eyeshadows & more from top international brands.',
    promos: [
      { title: 'Foundation Edit', sub: 'Find your perfect shade match', img: '/images/makeup-collection.webp', gradient: 'from-rose-600 to-pink-800' },
      { title: 'Lip Collection', sub: 'Trending shades this season', img: '/images/lip-collection.webp', gradient: 'from-red-500 to-rose-700' },
    ],
    chips: ['Lipstick', 'Foundation', 'Eyeshadow', 'Mascara', 'Blush', 'Primer'],
  },
  'hair-care': {
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    overlayGradient: 'from-amber-950/90 via-amber-950/60 to-amber-950/30',
    lightBg: 'from-amber-50 via-orange-50 to-yellow-50',
    accent: 'amber',
    accentColor: '#f59e0b',
    poster: '/images/poster-haircare.webp',
    tagline: 'Healthy Hair, Happy You',
    description: 'Professional shampoos, conditioners, masks & styling products for every hair type.',
    promos: [
      { title: 'Repair & Restore', sub: 'Deep conditioning treatments', img: '/images/repair-restore.webp', gradient: 'from-amber-600 to-orange-800' },
      { title: 'Styling Essentials', sub: 'Professional results at home', img: '/images/styling-essentials.webp', gradient: 'from-yellow-500 to-amber-700' },
    ],
    chips: ['Shampoo', 'Conditioner', 'Hair Mask', 'Serum', 'Oil', 'Styling'],
  },
  'body-care': {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    overlayGradient: 'from-emerald-950/90 via-emerald-950/60 to-emerald-950/30',
    lightBg: 'from-emerald-50 via-teal-50 to-cyan-50',
    accent: 'emerald',
    accentColor: '#10b981',
    poster: '/images/poster-bodycare.webp',
    tagline: 'Pamper Your Body',
    description: 'Luxury body scrubs, lotions, washes & spa essentials for radiant, silky-smooth skin.',
    promos: [
      { title: 'Spa at Home', sub: 'Luxury body scrubs & masks', img: '/images/spa-at-home.webp', gradient: 'from-teal-600 to-emerald-800' },
      { title: 'Summer Ready', sub: 'Moisturize & glow all day', img: '/images/summer-ready.webp', gradient: 'from-cyan-500 to-teal-700' },
    ],
    chips: ['Lotion', 'Scrub', 'Body Wash', 'Cream', 'Butter', 'Mist'],
  },
  'personal-care': {
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    overlayGradient: 'from-indigo-950/90 via-indigo-950/60 to-indigo-950/30',
    lightBg: 'from-blue-50 via-indigo-50 to-purple-50',
    accent: 'blue',
    accentColor: '#3b82f6',
    poster: '/images/poster-personalcare.webp',
    tagline: 'Self Care is the Best Care',
    description: 'Cleansers, moisturizers, serums, sunscreens & everyday essentials you can trust.',
    promos: [
      { title: 'Daily Essentials', sub: 'Everything for your routine', img: '/images/daily-essentials.webp', gradient: 'from-blue-600 to-indigo-800' },
      { title: 'Skincare Picks', sub: 'Serums, cleansers & more', img: '/images/skincare-picks.webp', gradient: 'from-indigo-500 to-purple-700' },
    ],
    chips: ['Cleanser', 'Moisturizer', 'Serum', 'Sunscreen', 'Deodorant', 'Soap'],
  },
}

const DEFAULT_THEME = {
  gradient: 'from-gray-600 via-gray-700 to-gray-800',
  overlayGradient: 'from-gray-950/90 via-gray-950/60 to-gray-950/30',
  lightBg: 'from-gray-50 via-gray-50 to-gray-100',
  accent: 'gray',
  accentColor: '#6b7280',
  poster: '/images/makeup-tools.webp',
  tagline: 'Explore Our Collection',
  description: 'Browse our curated selection of beauty essentials.',
  promos: [],
  chips: [],
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden animate-pulse rounded-2xl bg-white">
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 aspect-square" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-slate-200 rounded-full w-1/3" />
        <div className="h-4 bg-slate-200 rounded-full w-4/5" />
        <div className="h-5 bg-slate-200 rounded-full w-1/2" />
      </div>
    </div>
  )
}

const SORT_OPTIONS = [
  { label: 'Default', value: '', icon: '' },
  { label: 'Price: Low to High', value: 'price_asc', icon: '' },
  { label: 'Price: High to Low', value: 'price_desc', icon: '' },
  { label: 'Top Rated', value: 'rating', icon: '' },
]

/* ── Promo Banner inserted in the product grid ── */
function PromoBanner({ promo }) {
  return (
    <div className="relative col-span-2 rounded-2xl overflow-hidden group cursor-pointer"
      style={{ minHeight: '220px' }}>
      <img src={promo.img} alt={promo.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient} opacity-75`} />
      <div className="relative z-10 flex flex-col justify-end h-full p-5 sm:p-7">
        <span className="inline-flex items-center gap-1.5 text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Featured
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          {promo.title}
        </h3>
        <p className="text-white/70 text-sm">{promo.sub}</p>
        <span className="inline-flex items-center gap-1 text-white text-sm font-medium mt-3 group-hover:gap-2 transition-all">
          Shop Now <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  )
}

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const theme = CATEGORY_THEMES[slug] || DEFAULT_THEME

  useEffect(() => {
    setLoading(true)
    window.scrollTo(0, 0)
    Promise.all([getCategory(slug), getProducts({ category_slug: slug })]).then(([cat, prods]) => {
      setCategory(cat)
      setProducts(prods)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  const displayProducts = useCallback(() => {
    let result = [...products]
    if (maxPrice) result = result.filter(p => p.price <= parseFloat(maxPrice))
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating)
    return result
  }, [products, sort, maxPrice])

  const filtered = displayProducts()

  /* Insert promo banners at specific positions in the product grid */
  const renderProductGrid = () => {
    const items = []
    const promos = theme.promos || []
    let promoIndex = 0
    const promoPositions = [8, 20]

    filtered.forEach((p, i) => {
      items.push(<ProductCard key={p.id} product={p} accentColor={theme.accentColor} />)
      if (promoPositions.includes(i + 1) && promoIndex < promos.length) {
        items.push(<PromoBanner key={`promo-${promoIndex}`} promo={promos[promoIndex]} />)
        promoIndex++
      }
    })

    return items
  }

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* ═══ HERO POSTER (matches HomePage poster style) ═══ */}
      <section className="pt-4 sm:pt-6 pb-2">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb above poster */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3 sm:mb-4">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{category?.name || 'Category'}</span>
          </nav>

          {/* Poster card */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden group"
            style={{ minHeight: 'clamp(260px, 40vw, 360px)' }}>
            <img src={theme.poster} alt={category?.name || ''}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.02]" />
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.overlayGradient}`} />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="px-5 sm:px-12 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4 border border-white/10">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {category?.name || 'Collection'}
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {category?.name}
                </h1>
                <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-5 max-w-md">
                  {theme.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    {filtered.length} Products
                  </span>
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    100% Authentic
                  </span>
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    Free Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ QUICK CHIPS ═══ */}
      {theme.chips.length > 0 && (
        <section className={`bg-gradient-to-r ${theme.lightBg} border-b border-gray-100`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {theme.chips.map(chip => (
                <span key={chip}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 hover:scale-105"
                  style={{
                    borderColor: theme.accentColor + '40',
                    color: theme.accentColor,
                    backgroundColor: theme.accentColor + '08',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ═══ TOOLBAR ═══ */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 mr-1">
              {loading ? '' : `${filtered.length} products`}
            </span>

            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{
                borderColor: filterOpen || maxPrice ? theme.accentColor : '#e5e7eb',
                backgroundColor: filterOpen || maxPrice ? theme.accentColor + '10' : 'white',
                color: filterOpen || maxPrice ? theme.accentColor : '#374151',
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {maxPrice && (
                <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center"
                  style={{ backgroundColor: theme.accentColor }}>
                  1
                </span>
              )}
            </button>

            {maxPrice && (
              <button
                onClick={() => setMaxPrice('')}
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                Max KD {maxPrice} <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              {SORT_OPTIONS.find(o => o.value === sort)?.icon} {SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort'}
              <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-1.5 w-52 z-20 animate-fade-in">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-150 flex items-center gap-2 ${
                        sort === opt.value
                          ? 'font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      style={sort === opt.value ? { backgroundColor: theme.accentColor + '10', color: theme.accentColor } : {}}
                    >
                      <span>{opt.icon}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ═══ FILTER PANEL ═══ */}
        {filterOpen && (
          <div className="rounded-2xl p-5 mb-6 animate-fade-in border"
            style={{
              borderColor: theme.accentColor + '20',
              background: `linear-gradient(135deg, ${theme.accentColor}05, ${theme.accentColor}10)`,
            }}
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" style={{ color: theme.accentColor }} />
              Filters
            </h3>
            <div className="flex flex-wrap gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (KD)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-32 border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={{ borderColor: theme.accentColor + '40' }}
                  />
                  <button onClick={() => setMaxPrice('')}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PRODUCT GRID ═══ */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6 text-sm">Try adjusting your filters or browse another category.</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95">Back to Home</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {renderProductGrid()}
          </div>
        )}

        {/* ═══ BOTTOM CTA BANNER ═══ */}
        {!loading && filtered.length > 0 && (
          <section className="mt-10 rounded-3xl overflow-hidden relative" style={{ minHeight: '180px' }}>
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient}`} />
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-8 sm:p-10 gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Star className="w-3.5 h-3.5 fill-white/50" /> Free Delivery across Kuwait
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                  Can't find what you need?
                </h3>
                <p className="text-white/60 text-sm mt-1">Chat with us and we'll help you find the perfect product.</p>
              </div>
              <Link to="/" className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all shadow-lg active:scale-95 hover:gap-3">
                Browse All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
