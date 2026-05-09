import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Shield, RefreshCw, Headphones, Truck } from 'lucide-react'
import { getCategories, getProducts } from '../api'
import ProductCard from '../components/ProductCard'

function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#fff', border: '1px solid #F5EDD0' }}>
      <div className="bg-stone-200 aspect-square" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="h-4 bg-stone-200 rounded w-4/5" />
        <div className="h-5 bg-stone-200 rounded w-1/2" />
      </div>
    </div>
  )
}

const BANNERS = ['/banners/banner1.png', '/banners/banner2.png']

const PERKS = [
  { icon: Truck,       title: 'Free Delivery',    desc: 'Within 24 hours' },
  { icon: Shield,      title: '100% Authentic',   desc: 'All products verified' },
  { icon: RefreshCw,   title: 'Easy Returns',     desc: 'Hassle-free exchanges' },
  { icon: Headphones,  title: '24/7 Support',     desc: 'Always here to help' },
]

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="text-center mb-10">
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#C8A43A' }}>{eyebrow}</p>
      <h2 className="text-3xl font-bold" style={{ color: '#1A0800', fontFamily: 'Georgia, serif' }}>{title}</h2>
      <div className="gold-divider" />
    </div>
  )
}

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBanner, setActiveBanner] = useState(0)

  useEffect(() => {
    Promise.all([
      getCategories(),
      getProducts({ featured: true, limit: 8 }),
      getProducts({ limit: 8, skip: 20 }),
    ]).then(([cats, feat, newest]) => {
      setCategories(cats)
      setFeatured(feat)
      setNewArrivals(newest)
    }).finally(() => setLoading(false))
  }, [])

  // Auto-advance banner every 5 seconds
  useEffect(() => {
    const t = setInterval(() => setActiveBanner(b => (b + 1) % BANNERS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const prevBanner = useCallback(() => setActiveBanner(b => (b - 1 + BANNERS.length) % BANNERS.length), [])
  const nextBanner = useCallback(() => setActiveBanner(b => (b + 1) % BANNERS.length), [])

  return (
    <div style={{ background: '#FAF6EF' }}>

      {/* ── Banner Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#FAF6EF' }}>
        <div className="relative w-full" style={{ height: 'min(calc(100vw * 887 / 1774), 420px)' }}>
          {BANNERS.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700 overflow-hidden"
              style={{ opacity: i === activeBanner ? 1 : 0, zIndex: i === activeBanner ? 1 : 0 }}
            >
              {/* Blurred fill for side gaps */}
              <img src={src} aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110 opacity-50"
                style={{ filter: 'blur(24px)' }} />
              {/* Sharp full banner — no cropping */}
              <img src={src} alt={`Zosouq Banner ${i + 1}`}
                className="relative w-full h-full object-contain z-10" />
            </div>
          ))}

          {/* Arrows */}
          <button onClick={prevBanner}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
            style={{ background: 'rgba(26,8,0,0.6)', color: '#C8A43A', border: '1px solid rgba(200,164,58,0.4)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextBanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
            style={{ background: 'rgba(26,8,0,0.6)', color: '#C8A43A', border: '1px solid rgba(200,164,58,0.4)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setActiveBanner(i)}
                className="w-8 h-1.5 rounded-full transition-all"
                style={{ background: i === activeBanner ? '#C8A43A' : 'rgba(200,164,58,0.35)' }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Perks bar ───────────────────────────────────────── */}
      <section style={{ background: '#1A0800', borderTop: '1px solid rgba(200,164,58,0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(200,164,58,0.15)', border: '1px solid rgba(200,164,58,0.3)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#C8A43A' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#C8A43A' }}>{title}</p>
                  <p className="text-xs" style={{ color: '#A08050' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <SectionHeading eyebrow="Browse our collections" title="Shop by Category" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border text-center transition-all duration-200 hover:-translate-y-1"
              style={{ background: '#fff', borderColor: '#F0E6CE' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8A43A'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(200,164,58,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0E6CE'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #FDF8EE, #F8EDCA)' }}>
                {cat.icon}
              </div>
              <span className="text-sm font-semibold" style={{ color: '#1A0800' }}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-end justify-between mb-2">
          <SectionHeading eyebrow="Handpicked for you" title="Featured Products" />
          <Link to="/category/personal-care" className="hidden sm:flex items-center gap-1 text-sm font-semibold mb-4 transition-colors"
            style={{ color: '#C8A43A' }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                   : featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── Mid Banner ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <Link to="/category/perfumes">
          <div className="relative rounded-3xl overflow-hidden cursor-pointer group"
            style={{ border: '1px solid rgba(200,164,58,0.3)' }}>
            <img src="/banners/banner2.png" alt="Up to 70% off"
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ maxHeight: 320 }}
            />
          </div>
        </Link>
      </section>

      {/* ── New Arrivals ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-end justify-between mb-2">
          <SectionHeading eyebrow="Just in" title="New Arrivals" />
          <Link to="/category/makeup" className="hidden sm:flex items-center gap-1 text-sm font-semibold mb-4 transition-colors"
            style={{ color: '#C8A43A' }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                   : newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── Category Highlights ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <SectionHeading eyebrow="Explore" title="Top Collections" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { slug: 'perfumes',     label: 'Perfumes',     emoji: '🌸', sub: '1000+ fragrances' },
            { slug: 'makeup',       label: 'Makeup',       emoji: '💄', sub: '870+ products' },
            { slug: 'hair-care',    label: 'Hair Care',    emoji: '💇', sub: '380+ treatments' },
            { slug: 'body-care',    label: 'Body Care',    emoji: '🧴', sub: '300+ products' },
          ].map(c => (
            <Link key={c.slug} to={`/category/${c.slug}`}
              className="group relative rounded-2xl overflow-hidden p-6 flex flex-col gap-1 transition-all hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #1A0800 0%, #3D1800 100%)', border: '1px solid rgba(200,164,58,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C8A43A'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,164,58,0.25)'}
            >
              <span className="text-4xl mb-1">{c.emoji}</span>
              <p className="font-bold text-lg" style={{ color: '#C8A43A', fontFamily: 'Georgia, serif' }}>{c.label}</p>
              <p className="text-xs" style={{ color: '#A08050' }}>{c.sub}</p>
              <ArrowRight className="w-4 h-4 mt-2 transition-transform group-hover:translate-x-1" style={{ color: '#C8A43A' }} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────── */}
      <section style={{ background: '#1A0800', borderTop: '1px solid rgba(200,164,58,0.2)' }}>
        <div className="max-w-xl mx-auto px-4 py-14 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#C8A43A' }}>Stay Connected</p>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#F5EDD0', fontFamily: 'Georgia, serif' }}>Join the Zosouq Family</h2>
          <p className="text-sm mb-8" style={{ color: '#A08050' }}>Get exclusive deals, new arrivals and beauty tips delivered to your inbox.</p>
          <form className="flex gap-3" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address"
              className="flex-1 text-sm rounded-xl px-4 py-3 focus:outline-none border"
              style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(200,164,58,0.3)', color: '#F5EDD0' }}
            />
            <button type="submit" className="btn-primary whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}
