import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SlidersHorizontal, Sparkles, ArrowRight, Star } from 'lucide-react'
import { getCategory, getProducts, getBanner } from '../api'
import ProductCard from '../components/ProductCard'
import FilterDrawer from '../components/FilterDrawer'
import SEO from '../components/SEO'
import { useLanguage } from '../context/LanguageContext'

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

const CATEGORY_AR_COPY = {
  perfumes: {
    tagline: 'عطرك المميز بانتظارك',
    description: 'اكتشف أفخم العطور العربية والعود والعطور العالمية الأصلية في مكان واحد.',
    chips: ['عود', 'زهري', 'خشبي', 'منعش', 'شرقي', 'حمضيات'],
    promos: [
      { title: 'مجموعة العود العربي', sub: 'عطور حصرية من أجود أنواع العود' },
      { title: 'عطور المصممين', sub: 'وفر حتى ٦٠٪ من سعر التجزئة' },
    ],
  },
  makeup: {
    tagline: 'تألقي بإطلالة لا مثيل لها',
    description: 'تسوقي كريمات الأساس وأحمر الشفاه وظلال العيون الفاخرة من أشهر العلامات العالمية.',
    chips: ['أحمر شفاه', 'كريم أساس', 'ظلال عيون', 'ماسكارا', 'أحمر خدود', 'برايمر'],
    promos: [
      { title: 'مختارات كريم الأساس', sub: 'اعثري على الدرجة المثالية لبشرتك' },
      { title: 'مجموعة الشفاه', sub: 'ألوان رائجة لهذا الموسم' },
    ],
  },
  'hair-care': {
    tagline: 'شعر صحي وإطلالة أجمل',
    description: 'شامبو وبلسم وأقنعة ومنتجات تصفيف احترافية تناسب جميع أنواع الشعر.',
    chips: ['شامبو', 'بلسم', 'قناع الشعر', 'سيروم', 'زيت', 'تصفيف'],
    promos: [
      { title: 'إصلاح واستعادة', sub: 'علاجات ترطيب عميق للشعر' },
      { title: 'أساسيات التصفيف', sub: 'نتائج احترافية في المنزل' },
    ],
  },
  'body-care': {
    tagline: 'دللي جسمك',
    description: 'مقشرات ولوشن وغسول وعلاجات سبا فاخرة لبشرة ناعمة ومشرقة.',
    chips: ['لوشن', 'مقشر', 'غسول الجسم', 'كريم', 'زبدة الجسم', 'رذاذ'],
    promos: [
      { title: 'سبا في المنزل', sub: 'مقشرات وأقنعة فاخرة للجسم' },
      { title: 'استعدي للصيف', sub: 'ترطيب وإشراقة طوال اليوم' },
    ],
  },
  'personal-care': {
    tagline: 'العناية بنفسك هي الأفضل',
    description: 'منظفات ومرطبات وسيرومات وواقي شمس واحتياجات يومية يمكنك الوثوق بها.',
    chips: ['منظف', 'مرطب', 'سيروم', 'واقي شمس', 'مزيل عرق', 'صابون'],
    promos: [
      { title: 'الأساسيات اليومية', sub: 'كل ما تحتاجه لروتينك اليومي' },
      { title: 'مختارات العناية بالبشرة', sub: 'سيرومات ومنظفات والمزيد' },
    ],
  },
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
  const { t } = useLanguage()

  return (
    <div className="relative col-span-2 rounded-2xl overflow-hidden group cursor-pointer"
      dir="ltr" style={{ minHeight: '220px' }}>
      <img src={promo.img} alt={promo.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
      <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient} opacity-75`} />
      <div className="relative z-10 flex flex-col justify-end h-full p-5 sm:p-7">
        <span className="inline-flex items-center gap-1.5 text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> {t('featured_products')}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          {promo.title}
        </h3>
        <p className="text-white/70 text-sm">{promo.sub}</p>
        <span className="inline-flex items-center gap-1 text-white text-sm font-medium mt-3 group-hover:gap-2 transition-all">
          {t('shop_now')} <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  )
}

const BANNER_CACHE_TTL = 60 * 60 * 1000 // 1 hour

function readBannerCache(key) {
  try {
    const raw = localStorage.getItem(`banner_${key}`)
    if (!raw) return undefined
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > BANNER_CACHE_TTL) { localStorage.removeItem(`banner_${key}`); return undefined }
    return data
  } catch { return undefined }
}

function writeBannerCache(key, data) {
  try { localStorage.setItem(`banner_${key}`, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

function getDiscount(p) {
  if (!p.original_price || p.original_price <= p.price) return 0
  return Math.round(((p.original_price - p.price) / p.original_price) * 100)
}

export default function CategoryPage() {
  const { lang, t } = useLanguage()
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [customPromos, setCustomPromos] = useState(null)
  const [customHero, setCustomHero] = useState(undefined)

  // Applied filter values
  const [appliedBrands,      setAppliedBrands]      = useState([])
  const [appliedMinPrice,    setAppliedMinPrice]    = useState('')
  const [appliedMaxPrice,    setAppliedMaxPrice]    = useState('')
  const [appliedSort,        setAppliedSort]        = useState('')
  const [appliedMinDiscount, setAppliedMinDiscount] = useState(1)

  const theme = CATEGORY_THEMES[slug] || DEFAULT_THEME

  // Reset filters when category changes
  useEffect(() => {
    setAppliedBrands([]); setAppliedMinPrice(''); setAppliedMaxPrice(''); setAppliedSort(''); setAppliedMinDiscount(1)
    setCustomPromos(null)
    const slugKey = slug.replace(/-/g, '_')
    const cachedHero = readBannerCache(`hero_${slugKey}`)
    setCustomHero(cachedHero !== undefined ? cachedHero : undefined)
    Promise.allSettled([
      getBanner(`category_hero_${slugKey}`),
      getBanner(`category_promo_${slugKey}_1`),
      getBanner(`category_promo_${slugKey}_2`),
    ]).then(([hero, p1, p2]) => {
      const heroData = hero.value ?? null
      writeBannerCache(`hero_${slugKey}`, heroData)
      setCustomHero(heroData)
      if (p1.value || p2.value) {
        const themePromos = (CATEGORY_THEMES[slug] || DEFAULT_THEME).promos || []
        const merged = themePromos.map((def, i) => {
          const val = [p1.value, p2.value][i]
          return val ? { ...def, ...val } : def
        })
        setCustomPromos(merged)
      }
    })
  }, [slug])

  // Fetch all products for this category once
  useEffect(() => {
    setLoading(true)
    window.scrollTo(0, 0)
    Promise.all([
      getCategory(slug),
      getProducts({ category_slug: slug, limit: 2000 }),
    ]).then(([cat, prods]) => {
      if (cat) setCategory(cat)
      setProducts(prods || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  // Extract brands from loaded products
  const brands = useMemo(() => {
    const set = new Set(products.map(p => p.brand).filter(Boolean))
    return [...set].sort()
  }, [products])

  // Apply all filters + sort client-side
  const filtered = useMemo(() => {
    let result = [...products]
    if (appliedBrands.length > 0)  result = result.filter(p => appliedBrands.includes(p.brand))
    if (appliedMinPrice)            result = result.filter(p => p.price >= parseFloat(appliedMinPrice))
    if (appliedMaxPrice)            result = result.filter(p => p.price <= parseFloat(appliedMaxPrice))
    if (appliedMinDiscount > 1)     result = result.filter(p => getDiscount(p) >= appliedMinDiscount)
    if (appliedSort === 'price_asc')   result.sort((a, b) => a.price - b.price)
    else if (appliedSort === 'price_desc') result.sort((a, b) => b.price - a.price)
    else if (appliedSort === 'rating')    result.sort((a, b) => b.rating - a.rating)
    else if (appliedSort === 'discount')  result.sort((a, b) => getDiscount(b) - getDiscount(a))
    return result
  }, [products, appliedBrands, appliedMinPrice, appliedMaxPrice, appliedSort, appliedMinDiscount])

  const handleFilterApply = ({ brands, minPrice, maxPrice, sort, minDiscount }) => {
    setAppliedBrands(brands); setAppliedMinPrice(minPrice)
    setAppliedMaxPrice(maxPrice); setAppliedSort(sort); setAppliedMinDiscount(minDiscount)
  }

  const activeFilterCount = appliedBrands.length + (appliedMinPrice || appliedMaxPrice ? 1 : 0) + (appliedSort ? 1 : 0) + (appliedMinDiscount > 1 ? 1 : 0)

  const heroOverride = customHero ? {
    ...(customHero.img ? { poster: customHero.img } : {}),
    ...(customHero.tagline ? { tagline: customHero.tagline } : {}),
    ...(customHero.description ? { description: customHero.description } : {}),
  } : {}
  const localizedTheme = lang === 'ar' && CATEGORY_AR_COPY[slug]
    ? { ...theme, ...CATEGORY_AR_COPY[slug], ...heroOverride }
    : { ...theme, ...heroOverride }

  /* Insert promo banners at specific positions in the product grid */
  const renderProductGrid = () => {
    const items = []
    const sourcePromos = customPromos ?? (theme.promos || [])
    const promos = lang === 'ar' && CATEGORY_AR_COPY[slug]
      ? sourcePromos.map((promo, index) => ({
          ...promo,
          ...CATEGORY_AR_COPY[slug].promos[index],
        }))
      : sourcePromos
    let promoIndex = 0
    const promoPositions = [8, 20]

    filtered.forEach((p, i) => {
      items.push(<ProductCard key={p.id} product={p} accentColor={theme.accentColor} priority={items.length < 6} />)
      if (promoPositions.includes(i + 1) && promoIndex < promos.length) {
        items.push(<PromoBanner key={`promo-${promoIndex}`} promo={promos[promoIndex]} />)
        promoIndex++
      }
    })

    return items
  }

  const catName = t(slug?.replace(/-/g, '_')) || category?.name || ''
  const displayDescription = localizedTheme.description
  const catDesc = category?.description || `Shop authentic ${catName} products in Kuwait. Same-day delivery. Free on orders over KD 10.`
  const catImage = theme.poster || '/images/luxury-perfumes.webp'
  const displayCount = filtered.length
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.zosouq.com/' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://www.zosouq.com/categories' },
      { '@type': 'ListItem', position: 3, name: catName, item: `https://www.zosouq.com/category/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SEO
        title={`Buy ${catName} Online in Kuwait`}
        description={`${catDesc} Browse ${displayCount > 0 ? displayCount + '+' : 'hundreds of'} authentic products with same-day delivery across Kuwait.`}
        image={catImage}
        path={`/category/${slug}`}
        jsonLd={breadcrumbJsonLd}
      />

      {/* ═══ HERO POSTER (matches HomePage poster style) ═══ */}
      <section className="pt-4 sm:pt-6 pb-2" dir="ltr">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb above poster */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3 sm:mb-4">
            <Link to="/" className="hover:text-gray-700 transition-colors">{t('home')}</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{catName || t('categories')}</span>
          </nav>

          {/* Poster card */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden group"
            style={{ minHeight: 'clamp(260px, 40vw, 360px)' }}>
            {customHero !== undefined && (
              <img src={localizedTheme.poster} alt={catName}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.02]"
                loading="eager" fetchPriority="high" decoding="async" />
            )}
            <div className={`absolute inset-0 bg-gradient-to-r ${localizedTheme.overlayGradient}`} />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="px-5 sm:px-12 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4 border border-white/10">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {localizedTheme.tagline || catName || t('collection')}
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {catName}
                </h1>
                <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-5 max-w-md">
                  {displayDescription}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    {displayCount} {t('products')}
                  </span>
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    {t('authentic')}
                  </span>
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    {t('same_day')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ QUICK CHIPS ═══ */}
      {localizedTheme.chips.length > 0 && (
        <section dir="ltr" className={`bg-gradient-to-r ${localizedTheme.lightBg} border-b border-gray-100`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full">
              {localizedTheme.chips.map(chip => (
                <span key={chip}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 hover:scale-105"
                  style={{
                    borderColor: localizedTheme.accentColor + '40',
                    color: localizedTheme.accentColor,
                    backgroundColor: localizedTheme.accentColor + '08',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FILTER DRAWER ═══ */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        brands={brands}
        accentColor={theme.accentColor}
        appliedBrands={appliedBrands}
        appliedMinPrice={appliedMinPrice}
        appliedMaxPrice={appliedMaxPrice}
        appliedSort={appliedSort}
        appliedMinDiscount={appliedMinDiscount}
        onApply={handleFilterApply}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ═══ TOOLBAR ═══ */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 hover:shadow-md"
            style={{
              borderColor: activeFilterCount > 0 ? theme.accentColor : '#e5e7eb',
              backgroundColor: activeFilterCount > 0 ? theme.accentColor + '10' : 'white',
              color: activeFilterCount > 0 ? theme.accentColor : '#374151',
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('filters')} & Sort
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center"
                style={{ backgroundColor: theme.accentColor }}>
                {activeFilterCount}
              </span>
            )}
          </button>
          <span className="text-sm text-gray-500">
            {loading ? '' : `${displayCount} ${t('products')}`}
          </span>
        </div>

        {/* ═══ PRODUCT GRID ═══ */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('no_products')}</h3>
            <p className="text-gray-500 mb-6 text-sm">{t('adjust_filters')}</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95">{t('back_home')}</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {renderProductGrid()}
            </div>
          </>
        )}

        {/* ═══ BOTTOM CTA BANNER ═══ */}
        {!loading && filtered.length > 0 && (
          <section dir="ltr" className="mt-10 rounded-3xl overflow-hidden relative" style={{ minHeight: '180px' }}>
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient}`} />
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-8 sm:p-10 gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Star className="w-3.5 h-3.5 fill-white/50" /> {t('same_day_announcement')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                  {t('cant_find')}
                </h3>
                <p className="text-white/60 text-sm mt-1">{t('cant_find_sub')}</p>
              </div>
              <Link to="/" className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all shadow-lg active:scale-95 hover:gap-3">
                {t('browse_all')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
