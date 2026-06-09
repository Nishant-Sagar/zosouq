import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { SlidersHorizontal, Zap, Sparkles } from 'lucide-react'
import { getProducts, getBanner } from '../api'
import ProductCard from '../components/ProductCard'
import FilterDrawer from '../components/FilterDrawer'
import SEO from '../components/SEO'

const CATEGORY_CONFIG = {
  perfumes: {
    label: 'Perfumes',
    poster: '/images/poster-perfumes.webp',
    accent: '#7c3aed',
    overlay: 'from-violet-950/90 via-violet-950/60 to-violet-950/20',
    tagline: 'Up to 55% Off Perfumes',
    description: 'Authentic Arabian ouds & international designer fragrances at unbeatable prices.',
  },
  makeup: {
    label: 'Makeup',
    poster: '/images/poster-makeup.webp',
    accent: '#ec4899',
    overlay: 'from-rose-950/90 via-rose-950/60 to-rose-950/20',
    tagline: 'Up to 55% Off Makeup',
    description: 'Premium foundations, lipsticks, eyeshadows & more from top international brands.',
  },
  'hair-care': {
    label: 'Hair Care',
    poster: '/images/poster-haircare.webp',
    accent: '#f59e0b',
    overlay: 'from-amber-950/90 via-amber-950/60 to-amber-950/20',
    tagline: 'Up to 55% Off Hair Care',
    description: 'Professional shampoos, conditioners, masks & styling products for every hair type.',
  },
  'body-care': {
    label: 'Body Care',
    poster: '/images/poster-bodycare.webp',
    accent: '#10b981',
    overlay: 'from-emerald-950/90 via-emerald-950/60 to-emerald-950/20',
    tagline: 'Up to 55% Off Body Care',
    description: 'Luxury body scrubs, lotions, washes & spa essentials for radiant skin.',
  },
  'personal-care': {
    label: 'Personal Care',
    poster: '/images/poster-personalcare.webp',
    accent: '#3b82f6',
    overlay: 'from-indigo-950/90 via-indigo-950/60 to-indigo-950/20',
    tagline: 'Up to 55% Off Personal Care',
    description: 'Cleansers, moisturizers, serums, sunscreens & everyday essentials you can trust.',
  },
}

const DEFAULT_CONFIG = CATEGORY_CONFIG.perfumes

function getDiscount(p) {
  if (!p.original_price || p.original_price <= p.price) return 0
  return Math.round(((p.original_price - p.price) / p.original_price) * 100)
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden animate-pulse rounded-2xl bg-white">
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 aspect-square" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded-full w-4/5" />
        <div className="h-5 bg-slate-200 rounded-full w-1/2" />
      </div>
    </div>
  )
}

export default function SalePage() {
  const { slug } = useParams()
  const config = CATEGORY_CONFIG[slug] || DEFAULT_CONFIG

  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [heroBanner, setHeroBanner] = useState(null)

  const [appliedBrands,      setAppliedBrands]      = useState([])
  const [appliedMinPrice,    setAppliedMinPrice]    = useState('')
  const [appliedMaxPrice,    setAppliedMaxPrice]    = useState('')
  const [appliedSort,        setAppliedSort]        = useState('')
  const [appliedMinDiscount, setAppliedMinDiscount] = useState(1)

  useEffect(() => {
    setLoading(true)
    setAllProducts([])
    setHeroBanner(null)
    setAppliedBrands([]); setAppliedMinPrice(''); setAppliedMaxPrice('')
    setAppliedSort(''); setAppliedMinDiscount(1)
    const catSlug = slug || 'perfumes'
    const bannerKey = `sale_hero_${catSlug.replace(/-/g, '_')}`
    getBanner(bannerKey).then(b => setHeroBanner(b)).catch(() => {})
    getProducts({ category_slug: catSlug, limit: 2000 })
      .then(prods => setAllProducts(prods.filter(p => p.original_price && p.original_price > p.price)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  const brands = useMemo(() => {
    const set = new Set(allProducts.map(p => p.brand).filter(Boolean))
    return [...set].sort()
  }, [allProducts])

  const filtered = useMemo(() => {
    let result = [...allProducts]
    if (appliedBrands.length > 0)   result = result.filter(p => appliedBrands.includes(p.brand))
    if (appliedMinPrice)             result = result.filter(p => p.price >= parseFloat(appliedMinPrice))
    if (appliedMaxPrice)             result = result.filter(p => p.price <= parseFloat(appliedMaxPrice))
    if (appliedMinDiscount > 1)      result = result.filter(p => getDiscount(p) >= appliedMinDiscount)
    if (appliedSort === 'price_asc')        result.sort((a, b) => a.price - b.price)
    else if (appliedSort === 'price_desc')  result.sort((a, b) => b.price - a.price)
    else if (appliedSort === 'rating')      result.sort((a, b) => b.rating - a.rating)
    else result.sort((a, b) => getDiscount(b) - getDiscount(a))
    return result
  }, [allProducts, appliedBrands, appliedMinPrice, appliedMaxPrice, appliedMinDiscount, appliedSort])

  const handleFilterApply = ({ brands, minPrice, maxPrice, sort, minDiscount }) => {
    setAppliedBrands(brands); setAppliedMinPrice(minPrice)
    setAppliedMaxPrice(maxPrice); setAppliedSort(sort); setAppliedMinDiscount(minDiscount)
  }

  const activeFilterCount = appliedBrands.length
    + (appliedMinPrice || appliedMaxPrice ? 1 : 0)
    + (appliedSort ? 1 : 0)
    + (appliedMinDiscount > 1 ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SEO
        title={`${config.tagline} — Zosouq Sale`}
        description={`${config.description} Same-day delivery across Kuwait. Free on orders over KD 10.`}
        path={`/sale/${slug}`}
      />

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        brands={brands}
        accentColor={config.accent}
        appliedBrands={appliedBrands}
        appliedMinPrice={appliedMinPrice}
        appliedMaxPrice={appliedMaxPrice}
        appliedSort={appliedSort}
        appliedMinDiscount={appliedMinDiscount}
        onApply={handleFilterApply}
      />

      {/* ═══ HERO — same style as category page ═══ */}
      <section className="pt-4 sm:pt-6 pb-2" dir="ltr">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden group"
            style={{ minHeight: 'clamp(260px, 40vw, 360px)' }}>
            <img src={heroBanner?.img || config.poster} alt={config.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.02]"
              loading="eager" fetchPriority="high" decoding="async" />
            <div className={`absolute inset-0 bg-gradient-to-r ${config.overlay}`} />

            <div className="absolute inset-0 flex items-center">
              <div className="px-5 sm:px-12 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4 border border-white/10">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400" /> Limited Time Offer
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  Up to <span className="text-yellow-400">55% Off</span><br />{config.label}
                </h1>
                <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-5 max-w-md">
                  {heroBanner?.description || config.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {loading ? '…' : `${filtered.length} deals`}
                  </span>
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    🚚 Free over KD 10
                  </span>
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    💳 Cash on delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TOOLBAR + PRODUCTS ═══ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all hover:shadow-md"
            style={{
              borderColor: activeFilterCount > 0 ? config.accent : '#e5e7eb',
              backgroundColor: activeFilterCount > 0 ? config.accent + '10' : 'white',
              color: activeFilterCount > 0 ? config.accent : '#374151',
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters & Sort
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center"
                style={{ backgroundColor: config.accent }}>
                {activeFilterCount}
              </span>
            )}
          </button>
          <p className="text-sm text-gray-500">
            {loading ? '' : `${filtered.length} products`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products match your filters</h3>
            <p className="text-gray-500 text-sm mb-6">Try adjusting or clearing your filters</p>
            <button
              onClick={() => handleFilterApply({ brands: [], minPrice: '', maxPrice: '', sort: '', minDiscount: 1 })}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: config.accent }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} accentColor={config.accent} />)}
          </div>
        )}
      </div>
    </div>
  )
}
