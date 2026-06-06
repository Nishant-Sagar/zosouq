import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight, Truck, Shield, RotateCcw, Headphones, Zap, Clock, MapPin, Package, Percent, Sparkles, Award, Tag } from 'lucide-react'
import { getCategories, getProducts, getBanner } from '../api'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'

/* ─── Hero Slides (Livish-style with big discount callouts) ─── */
const HERO_SLIDES = [
  {
    img: '/images/luxury-perfumes.webp',
    title: 'Luxury Perfumes',
    subtitle: 'Over 1,000 authentic fragrances from top global brands',
    badge: 'Exclusively on Zosouq',
    discount: '26',
    cta: 'Shop Now',
    link: '/category/perfumes',
    gradient: 'from-gray-950/90 via-gray-950/60 to-gray-950/10',
    badgeBg: 'bg-amber-500',
    accentColor: 'text-amber-400',
    subtitleColor: 'text-amber-200',
  },
  {
    img: '/images/premium-makeup.webp',
    title: 'Premium Makeup',
    subtitle: 'Beauty essentials for every skin tone and occasion',
    badge: 'New Collection',
    discount: '40',
    cta: 'Shop Now',
    link: '/category/makeup',
    gradient: 'from-gray-950/90 via-gray-950/60 to-gray-950/10',
    badgeBg: 'bg-rose-500',
    accentColor: 'text-rose-400',
    subtitleColor: 'text-rose-200',
  },
  {
    img: '/images/body-care-essentials.webp',
    title: 'Body Care Essentials',
    subtitle: 'Nourish, restore, and glow with premium treatments',
    badge: 'Best Sellers',
    discount: '35',
    cta: 'Shop Now',
    link: '/category/body-care',
    gradient: 'from-gray-950/90 via-gray-950/60 to-gray-950/10',
    badgeBg: 'bg-emerald-500',
    accentColor: 'text-emerald-400',
    subtitleColor: 'text-emerald-200',
  },
]

/* ─── Circular Category Images (Livish-style) ─── */
const CATEGORY_CIRCLES = {
  'perfumes':      { img: '/images/designer-perfumes.webp', bg: 'bg-violet-50', ring: 'ring-violet-200' },
  'makeup':        { img: '/images/makeup-tools.webp', bg: 'bg-pink-50', ring: 'ring-pink-200' },
  'hair-care':     { img: '/images/styling-essentials.webp', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  'body-care':     { img: '/images/body-care-essentials.webp', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  'personal-care': { img: '/images/personal-care-circle.webp', bg: 'bg-blue-50', ring: 'ring-blue-200' },
}

/* ─── "Shop by Price" badges (Livish-style) ─── */
const PRICE_RANGES = [
  { label: '3',  max: 3,  bg: 'from-amber-600 to-yellow-700' },
  { label: '5',  max: 5,  bg: 'from-amber-700 to-yellow-800' },
  { label: '10', max: 10, bg: 'from-amber-700 to-amber-800' },
  { label: '15', max: 15, bg: 'from-amber-800 to-amber-900' },
  { label: '20', max: 20, bg: 'from-amber-800 to-yellow-900' },
  { label: '30', max: 30, bg: 'from-amber-900 to-yellow-950' },
]

/* ─── Quick-link bubbles (Livish-style extra categories) ─── */
const QUICK_LINKS = [
  { label: 'Deals',        link: '/category/perfumes',      img: '/images/deals.webp', badge: '%' },
  { label: 'Best Sellers',  link: '/category/personal-care', img: '/images/repair-restore.webp' },
  { label: 'New Arrivals',  link: '/category/makeup',        img: '/images/lip-collection.webp' },
  { label: 'Summer Sale',   link: '/category/body-care',     img: '/images/summer-sale.webp', badge: '%' },
  { label: 'Top Perfumes',  link: '/category/perfumes',      img: '/images/top-perfumes.webp' },
  { label: 'Hair Care',     link: '/category/hair-care',     img: '/images/hair-care-quick.webp' },
]

const PERKS = [
  { icon: Zap,        title: 'Same-Day Delivery', sub: 'Free over KD 10',    color: 'text-white', iconBg: 'bg-emerald-500', cardBg: 'bg-gradient-to-br from-emerald-50 to-teal-100', border: 'border-emerald-200', accent: 'text-emerald-700' },
  { icon: Shield,     title: '100% Authentic',  sub: 'Verified products',    color: 'text-white', iconBg: 'bg-blue-500',    cardBg: 'bg-gradient-to-br from-blue-50 to-indigo-100',   border: 'border-blue-200',    accent: 'text-blue-700' },
  { icon: RotateCcw,  title: 'Easy Returns',    sub: '14-day hassle-free',   color: 'text-white', iconBg: 'bg-amber-500',   cardBg: 'bg-gradient-to-br from-amber-50 to-orange-100',  border: 'border-amber-200',   accent: 'text-amber-700' },
  { icon: Headphones, title: '24/7 Support',    sub: 'We are here to help',  color: 'text-white', iconBg: 'bg-purple-500',  cardBg: 'bg-gradient-to-br from-purple-50 to-violet-100', border: 'border-purple-200',  accent: 'text-purple-700' },
]

const BADGE_COLORS = {
  red: '#dc2626', amber: '#d97706', emerald: '#059669',
  blue: '#2563eb', violet: '#7c3aed', pink: '#db2777',
}

const DEFAULT_SALE_POSTER_1 = {
  img: '/images/luxury-perfumes.webp',
  link: '/category/perfumes',
  badgeText: 'UP TO 70% OFF',
  badgeIcon: 'percent',
  badgeColor: 'red',
  eyebrow: 'Exclusive Deals',
  title: 'Luxury Perfumes at Unbeatable Prices',
  cta: 'Shop the Sale',
}

const DEFAULT_SALE_POSTER_2 = {
  img: '/images/hair-care-category.webp',
  link: '/category/hair-care',
  badgeText: 'NEW SEASON',
  badgeIcon: 'sparkles',
  badgeColor: 'amber',
  eyebrow: 'Fresh Arrivals',
  title: 'Hair Care Essentials',
  cta: 'Browse Collection',
}

const DEFAULT_DELIVERY_BANNER = {
  img: '/images/free-delivery.webp',
  title: 'Same-Day Delivery\nAnywhere in Kuwait',
  description: 'Order today, receive today. Free delivery on orders over KD 10. Cash on delivery available.',
  tags: 'All Kuwait Areas,Same-Day Delivery,Cash on Delivery',
}

/* ────────────────────────────────────────────────────────
   Product Carousel (with arrows like Livish)
   ──────────────────────────────────────────────────────── */
function ProductCarousel({ title, subtitle, linkTo, products, loading, accentColor, bg }) {
  const ref = useRef(null)
  const [canL, setCanL] = useState(false)
  const [canR, setCanR] = useState(true)

  const check = () => {
    const el = ref.current; if (!el) return
    setCanL(el.scrollLeft > 4)
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }
  useEffect(check, [products, loading])
  const go = d => { ref.current?.scrollBy({ left: d * 260, behavior: 'smooth' }); setTimeout(check, 400) }

  return (
    <section className={`pt-6 pb-4 sm:pt-8 sm:pb-6 ${bg || ''}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header like Livish — bold title left, "Show All" button right */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
          </div>
          {linkTo && (
            <Link to={linkTo} className="px-5 py-2 rounded-xl border-2 border-gray-800 text-sm font-semibold text-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-300">
              Show All
            </Link>
          )}
        </div>

        <div className="relative group">
          {/* Left arrow */}
          {canL && (
            <button onClick={() => go(-1)} className="absolute -left-2 sm:-left-5 top-1/3 z-10 w-10 h-10 bg-gray-900 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div ref={ref} onScroll={check} className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2">
            {loading
              ? Array(6).fill(0).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[180px] sm:w-[220px] animate-pulse">
                    <div className="bg-gray-100 rounded-2xl aspect-square" />
                    <div className="mt-3 space-y-2"><div className="h-3 bg-gray-100 rounded w-4/5" /><div className="h-4 bg-gray-100 rounded w-1/2" /></div>
                  </div>
                ))
              : products.map(p => (
                  <div key={p.id} className="flex-shrink-0 w-[180px] sm:w-[220px]">
                    <ProductCard product={p} accentColor={accentColor} />
                  </div>
                ))
            }
          </div>
          {/* Right arrow */}
          {canR && (
            <button onClick={() => go(1)} className="absolute -right-2 sm:-right-5 top-1/3 z-10 w-10 h-10 bg-gray-900 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   H O M E   P A G E  (Livish-inspired)
   ═══════════════════════════════════════════════════════ */
export default function HomePage() {
  const [categories, setCategories]     = useState([])
  const [featured, setFeatured]         = useState([])
  const [newArrivals, setNewArrivals]   = useState([])
  const [trending, setTrending]         = useState([])
  const [deals, setDeals]               = useState([])
  const [topPerfumes, setTopPerfumes]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [slide, setSlide]               = useState(0)

  const [heroSlides, setHeroSlides]           = useState(HERO_SLIDES)
  const [salePoster1, setSalePoster1]         = useState(DEFAULT_SALE_POSTER_1)
  const [salePoster2, setSalePoster2]         = useState(DEFAULT_SALE_POSTER_2)
  const [deliveryBanner, setDeliveryBanner]   = useState(DEFAULT_DELIVERY_BANNER)

  useEffect(() => {
    Promise.all([
      getCategories(),
      getProducts({ featured: true, limit: 12 }),
      getProducts({ limit: 12, skip: 15 }),
      getProducts({ limit: 12, skip: 35 }),
      getProducts({ limit: 10, skip: 55 }),
      getProducts({ category_slug: 'perfumes', limit: 12 }),
    ]).then(([cats, feat, newest, trend, dl, perfs]) => {
      setCategories(cats); setFeatured(feat); setNewArrivals(newest); setTrending(trend); setDeals(dl); setTopPerfumes(perfs)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    Promise.allSettled([
      getBanner('home_hero_slide_1'),
      getBanner('home_hero_slide_2'),
      getBanner('home_hero_slide_3'),
      getBanner('home_sale_poster_1'),
      getBanner('home_sale_poster_2'),
      getBanner('home_delivery_banner'),
    ]).then(([s1, s2, s3, p1, p2, del]) => {
      const slides = HERO_SLIDES.map((def, i) => {
        const val = [s1.value, s2.value, s3.value][i]
        return val ? { ...def, ...val } : def
      })
      setHeroSlides(slides)
      if (p1.value) setSalePoster1(prev => ({ ...prev, ...p1.value }))
      if (p2.value) setSalePoster2(prev => ({ ...prev, ...p2.value }))
      if (del.value) setDeliveryBanner(prev => ({ ...prev, ...del.value }))
    })
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Zosouq',
      url: 'https://www.zosouq.com',
      logo: 'https://www.zosouq.com/images/luxury-perfumes.webp',
      description: "Kuwait's premier same-day beauty and perfume delivery platform.",
      address: { '@type': 'PostalAddress', addressCountry: 'KW' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Zosouq',
      url: 'https://www.zosouq.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://www.zosouq.com/search?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
    { '@context': 'https://schema.org', '@type': 'SiteNavigationElement', name: 'Perfumes',      url: 'https://www.zosouq.com/category/perfumes' },
    { '@context': 'https://schema.org', '@type': 'SiteNavigationElement', name: 'Makeup',        url: 'https://www.zosouq.com/category/makeup' },
    { '@context': 'https://schema.org', '@type': 'SiteNavigationElement', name: 'Hair Care',     url: 'https://www.zosouq.com/category/hair-care' },
    { '@context': 'https://schema.org', '@type': 'SiteNavigationElement', name: 'Body Care',     url: 'https://www.zosouq.com/category/body-care' },
    { '@context': 'https://schema.org', '@type': 'SiteNavigationElement', name: 'Personal Care', url: 'https://www.zosouq.com/category/personal-care' },
  ]

  return (
    <div className="bg-white">
      <SEO
        description="Shop 4,400+ authentic perfumes, makeup, skincare & hair care. Same-day delivery across all Kuwait. Free on orders over KD 10. Cash on delivery."
        path="/"
        jsonLd={homeJsonLd}
      />

      {/* ════════════════════════════════════════════════
          HERO CAROUSEL  (Livish-style with discount badge)
          ════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 sm:py-5">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl" style={{ height: 'clamp(260px, 38vw, 400px)' }}>
            {heroSlides.map((s, i) => (
              <div key={i} className="absolute inset-0 transition-all duration-[1200ms] ease-in-out"
                style={{ opacity: i === slide ? 1 : 0, transform: i === slide ? 'scale(1)' : 'scale(1.04)' }}>
                <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
                <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="px-5 sm:px-12 w-full max-w-xl">
                    <div className={`transition-all duration-700 ${i === slide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                      style={{ transitionDelay: i === slide ? '300ms' : '0ms' }}>
                      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-2 drop-shadow-lg">
                        {s.title}
                      </h1>
                      <p className={`${s.subtitleColor} text-sm sm:text-base font-medium mb-3 sm:mb-4 drop-shadow`}>{s.subtitle}</p>
                      <div className={`inline-block ${s.badgeBg} text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-lg`}>
                        {s.badge}
                      </div>
                      <div className="flex items-end gap-1 mb-4 sm:mb-5">
                        <span className={`text-5xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tighter ${s.accentColor} drop-shadow-lg`}>{s.discount}</span>
                        <div className="mb-0.5 sm:mb-1">
                          <span className={`text-xl sm:text-3xl font-bold ${s.accentColor}`}>%</span>
                          <span className="block text-[10px] sm:text-sm font-bold text-white/80 uppercase tracking-wider">OFF</span>
                        </div>
                      </div>
                      <Link to={s.link}
                        className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 hover:gap-3 transition-all shadow-xl active:scale-95">
                        {s.cta} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Nav arrows */}
            <button onClick={() => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="absolute left-1 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-10 sm:h-10 bg-black/15 sm:bg-white/20 backdrop-blur-sm sm:backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition border border-white/5 sm:border-white/10 sm:shadow-md">
              <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white/70 sm:text-white" />
            </button>
            <button onClick={() => setSlide(s => (s + 1) % HERO_SLIDES.length)}
              className="absolute right-1 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-10 sm:h-10 bg-black/15 sm:bg-white/20 backdrop-blur-sm sm:backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition border border-white/5 sm:border-white/10 sm:shadow-md">
              <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white/70 sm:text-white" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${i === slide ? 'w-7 sm:w-8 bg-white shadow-md' : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/60'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          QUICK-LINK CIRCLES  (Livish-style round bubbles)
          ════════════════════════════════════════════════ */}
      <section className="py-4 sm:py-5 bg-gradient-to-b from-white via-rose-50/30 to-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar sm:justify-center py-2 px-2">
            {QUICK_LINKS.map((ql) => (
              <Link key={ql.label} to={ql.link} className="group flex flex-col items-center gap-2 flex-shrink-0">
                <div className="relative w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-rose-400 transition-all duration-300 shadow-md group-hover:shadow-xl bg-white">
                  <img src={ql.img} alt={ql.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  {ql.badge && (
                    <div className="absolute top-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <Percent className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center group-hover:text-rose-600 transition-colors">{ql.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SHOP BY CATEGORY  (Livish-style circle icons)
          ════════════════════════════════════════════════ */}
      <section className="pt-4 pb-8 sm:pt-6 sm:pb-12 bg-gradient-to-b from-rose-50/80 via-white to-violet-50/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shop by Category</h2>
          </div>
          {/* Mobile: horizontal scroll. Desktop: centered flex */}
          <div className="flex sm:justify-center gap-6 sm:gap-12 overflow-x-auto no-scrollbar py-4 px-3">
            {categories.map(cat => {
              const vis = CATEGORY_CIRCLES[cat.slug] || { img: '', bg: 'bg-gray-50', ring: 'ring-gray-200' }
              return (
                <Link key={cat.id} to={`/category/${cat.slug}`}
                  className="group flex flex-col items-center gap-2.5 flex-shrink-0 min-w-[72px]">
                  <div className={`relative w-[72px] h-[72px] sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-[3px] sm:ring-4 ${vis.ring} shadow-lg group-hover:shadow-2xl transition-all duration-400 ${vis.bg}`}>
                    <img src={vis.img} alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-rose-600 transition-colors text-center leading-tight">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PERKS BAR
          ════════════════════════════════════════════════ */}
      <section className="py-3 sm:py-4 bg-gradient-to-r from-rose-50/60 via-white to-violet-50/60 border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-3">
            {PERKS.map(({ icon: Icon, title, sub, color, iconBg, cardBg, border, accent }) => (
              <div key={title} className={`${cardBg} ${border} border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 flex-1 min-w-[160px] group hover:shadow-md transition-all duration-300`}>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs sm:text-sm font-bold ${accent} truncate`}>{title}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          BEST SELLERS  (carousel)
          ════════════════════════════════════════════════ */}
      <ProductCarousel
        title="Best Sellers"
        subtitle="Most loved by our customers"
        linkTo="/category/personal-care"
        products={featured}
        loading={loading}
        accentColor="#e11d48"
        bg="bg-gradient-to-b from-rose-50/50 via-white to-violet-50/30"
      />

      {/* ════════════════════════════════════════════════
          SHOP BY PRICE  (Livish-style "Under X KWD" badges)
          ════════════════════════════════════════════════ */}
      <section className="pt-0 pb-6 sm:pt-0 sm:pb-8 bg-gradient-to-b from-violet-50/40 via-white to-amber-50/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Shop by Price</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {PRICE_RANGES.map(pr => (
              <Link key={pr.label} to={`/search?max_price=${pr.max}`}
                className="group relative rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${pr.bg}`} />
                {/* Subtle texture pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
                <div className="relative z-10 text-center text-white">
                  <p className="text-xs sm:text-sm font-semibold opacity-90 tracking-wider uppercase">Under</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black leading-none my-1">{pr.label}</p>
                  <p className="text-xs sm:text-sm font-bold tracking-widest">KWD</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SALE POSTERS — Two-column (Livish-style promo)
          ════════════════════════════════════════════════ */}
      <section className="py-4 sm:py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[salePoster1, salePoster2].map((poster, idx) => (
              <Link key={idx} to={poster.link}
                className="group relative rounded-2xl overflow-hidden flex items-end" style={{ minHeight: '200px' }}>
                <img src={poster.img} alt={poster.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/40 to-transparent" />
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                  <div
                    className="text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg"
                    style={{ backgroundColor: BADGE_COLORS[poster.badgeColor] || '#dc2626' }}
                  >
                    {poster.badgeIcon === 'sparkles'
                      ? <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      : <Percent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    }
                    {poster.badgeText}
                  </div>
                </div>
                <div className="relative z-10 p-5 sm:p-7">
                  <p className="text-white/50 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">{poster.eyebrow}</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight">{poster.title}</h3>
                  <span className="inline-flex items-center gap-1.5 text-white text-xs sm:text-sm font-semibold mt-2 sm:mt-3 group-hover:gap-2.5 transition-all">
                    {poster.cta} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          NEW ARRIVALS (carousel)
          ════════════════════════════════════════════════ */}
      <ProductCarousel
        title="New Arrivals"
        subtitle="The latest additions to our collection"
        linkTo="/category/makeup"
        products={newArrivals}
        loading={loading}
        accentColor="#7c3aed"
        bg="bg-gradient-to-b from-violet-50/40 via-white to-rose-50/30"
      />

      {/* ════════════════════════════════════════════════
          FREE DELIVERY POSTER (Full-width banner)
          ════════════════════════════════════════════════ */}
      <section className="py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden group" style={{ minHeight: 'clamp(280px, 45vw, 340px)' }}>
            <img src={deliveryBanner.img} alt={deliveryBanner.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.02]" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-900/70 to-emerald-900/40" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-5 sm:px-12 max-w-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 flex items-center justify-center">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 flex items-center justify-center">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                  {deliveryBanner.title.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br/>}</span>
                  ))}
                </h2>
                <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-5">{deliveryBanner.description}</p>
                <div className="flex flex-wrap gap-2">
                  {(deliveryBanner.tags || '').split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TOP SELLING PERFUMES  (Livish-style section)
          ════════════════════════════════════════════════ */}
      <ProductCarousel
        title="Top Selling Perfumes"
        subtitle="Most popular fragrances in Kuwait"
        linkTo="/category/perfumes"
        products={topPerfumes}
        loading={loading}
        accentColor="#8b5cf6"
        bg="bg-gradient-to-b from-amber-50/40 via-white to-violet-50/30"
      />

      {/* ════════════════════════════════════════════════
          EXCLUSIVE COLLECTION POSTER
          ════════════════════════════════════════════════ */}
      <section className="py-4 sm:py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden group" style={{ minHeight: 'clamp(280px, 40vw, 380px)' }}>
            <img src="/images/exclusive-collection.webp"
              alt="Exclusive perfume collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.03]" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-gray-950/30" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-5 sm:px-12 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4 border border-white/10">
                  <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Exclusive Collection
                </div>
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                  Luxury Perfumes<br/>Under One Roof
                </h2>
                <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-5">Authentic fragrances from Arabian and international brands.</p>
                <Link to="/category/perfumes"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-all shadow-lg hover:gap-3 active:scale-95">
                  Explore Collection <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TRENDING NOW (carousel)
          ════════════════════════════════════════════════ */}
      <ProductCarousel
        title="Trending Now"
        subtitle="What everyone is adding to their cart"
        linkTo="/category/perfumes"
        products={trending}
        loading={loading}
        accentColor="#ea580c"
        bg="bg-gradient-to-b from-rose-50/40 via-white to-amber-50/30"
      />

      {/* ════════════════════════════════════════════════
          MEGA SALE POSTER  (3-column grid)
          ════════════════════════════════════════════════ */}
      <section className="py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Big Sale Card */}
            <Link to="/category/makeup" className="group relative rounded-2xl overflow-hidden flex items-center" style={{ minHeight: 'clamp(220px, 35vw, 280px)' }}>
              <img src="/images/makeup-collection.webp" alt="Makeup sale"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-r from-rose-900/90 via-rose-900/60 to-rose-900/20" />
              <div className="relative z-10 p-5 sm:p-10">
                <div className="bg-red-600 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold inline-flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3 shadow-md">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> FLASH SALE
                </div>
                <h3 className="text-xl sm:text-3xl font-bold text-white mb-1 leading-tight">
                  Up to 50% Off<br/>Premium Makeup
                </h3>
                <p className="text-white/50 text-xs sm:text-sm mb-3 sm:mb-4 max-w-sm">Limited time only. Foundation, lipstick, eyeshadow and more.</p>
                <span className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-all shadow-lg group-hover:gap-3">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          THIS WEEK'S DEALS (grid)
          ════════════════════════════════════════════════ */}
      <section className="pt-6 pb-8 sm:pt-8 sm:pb-12 bg-gradient-to-b from-amber-50/60 via-white to-rose-50/40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-bold mb-2">
                <Zap className="w-3.5 h-3.5" /> Limited Time Offers
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">This Week's Deals</h2>
            </div>
            <Link to="/category/body-care" className="px-5 py-2 rounded-xl border-2 border-gray-800 text-sm font-semibold text-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-300">
              Show All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading
              ? Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-2xl aspect-square" />
                    <div className="mt-3 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
                  </div>
                ))
              : deals.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          HANDPICKED PRODUCTS (grid)
          ════════════════════════════════════════════════ */}
      <section className="pt-6 pb-8 sm:pt-8 sm:pb-12 bg-gradient-to-b from-rose-50/50 via-white to-violet-50/40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Handpicked For You</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {loading
              ? Array(12).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-100 rounded-2xl aspect-square" />
                    <div className="mt-3 space-y-2"><div className="h-3 bg-gray-100 rounded w-4/5" /><div className="h-4 bg-gray-100 rounded w-1/2" /></div>
                  </div>
                ))
              : [...featured, ...newArrivals].slice(0, 12).map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>


</div>
  )
}
