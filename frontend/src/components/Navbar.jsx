import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, Heart, LayoutGrid, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { getCategories } from '../api'

const CAT_COLORS = {
  'perfumes': 'from-violet-500 to-purple-600',
  'makeup': 'from-pink-500 to-rose-600',
  'hair-care': 'from-amber-500 to-orange-600',
  'body-care': 'from-emerald-500 to-teal-600',
  'personal-care': 'from-blue-500 to-indigo-600',
}

const CAT_NAV_IMGS = {
  'perfumes': '/images/nav-perfumes.webp',
  'makeup': '/images/nav-makeup.webp',
  'hair-care': '/images/nav-haircare.webp',
  'body-care': '/images/nav-bodycare.webp',
  'personal-care': '/images/nav-personalcare.webp',
}

const CAT_SUBTLE_BG = {
  'perfumes': 'bg-violet-50 hover:bg-violet-100/80',
  'makeup': 'bg-pink-50 hover:bg-pink-100/80',
  'hair-care': 'bg-amber-50 hover:bg-amber-100/80',
  'body-care': 'bg-emerald-50 hover:bg-emerald-100/80',
  'personal-care': 'bg-blue-50 hover:bg-blue-100/80',
}

export default function Navbar() {
  const { totalItems } = useCart()
  const { totalWishlist } = useWishlist()
  const [categories, setCategories] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { getCategories().then(setCategories).catch(() => {}) }, [])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 2)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => { setMobileOpen(false) }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery('') }
  }

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white text-center text-xs py-2 px-4">
        <span>Free Shipping on Orders over <b>KD 10</b> — Arrives Next Day</span>
      </div>

      {/* ── Main Header ── */}
      <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'shadow-lg shadow-gray-100/50' : ''}`}
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 sm:h-16 gap-4">

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 -ml-1.5 text-gray-700 hover:text-gray-900">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600 shadow-lg shadow-pink-300/50 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3.5 4H16.5L3.5 16H16.5" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-bold italic tracking-wide"
                style={{
                  fontFamily: 'Georgia, serif',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #c026d3 50%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                Zosouq
              </span>
            </Link>

            {/* Desktop search bar */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-lg mx-auto">
              <div className="relative w-full">
                <input type="text" placeholder="Search for products..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all" />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {/* My Orders */}
              <Link to="/my-orders" className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors group hidden sm:block">
                <Package className={`w-5 h-5 transition-all duration-300 group-hover:scale-110`} />
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors group">
                <Heart className={`w-5 h-5 transition-all duration-300 ${totalWishlist > 0 ? 'text-pink-500 fill-pink-500' : 'group-hover:scale-110'}`} />
                {totalWishlist > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-pink-200">
                    {totalWishlist > 99 ? '99+' : totalWishlist}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-pink-200">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden pb-2.5">
            <form onSubmit={handleSearch} className="relative">
              <input type="text" placeholder="Search for products..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:border-pink-400 transition-all" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Desktop category nav — poster-style mini cards */}
        <nav className="hidden lg:block border-t border-gray-100/50">
          <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center justify-center gap-2">
            <Link to="/categories"
              className={`px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-xl flex items-center gap-1.5 ${
                location.pathname === '/categories'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100'
              }`}>
              <LayoutGrid className="w-3.5 h-3.5" />
              All
            </Link>
            <span className="w-px h-6 bg-gray-200 mx-0.5" />
            {categories.map(cat => {
              const active = location.pathname === `/category/${cat.slug}`
              const colorClass = CAT_COLORS[cat.slug] || 'from-gray-500 to-gray-600'
              const navImg = CAT_NAV_IMGS[cat.slug]
              const subtleBg = CAT_SUBTLE_BG[cat.slug] || 'bg-gray-50 hover:bg-gray-100'
              return (
                <Link key={cat.id} to={`/category/${cat.slug}`}
                  className={`group relative overflow-hidden rounded-xl flex items-center gap-2 px-2 py-1.5 transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r ' + colorClass + ' text-white shadow-md'
                      : subtleBg + ' text-gray-700'
                  }`}>
                  <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-black/5">
                    <img src={navImg} alt="" className={`w-full h-full object-cover ${cat.slug === 'hair-care' ? 'object-top' : ''}`} />
                  </div>
                  <span className="text-sm font-medium pr-1">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto animate-slide-in-left"
            onClick={e => e.stopPropagation()}>
            {/* Menu header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600 shadow-lg shadow-pink-300/50 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3.5 4H16.5L3.5 16H16.5" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-lg font-bold italic"
                  style={{
                    fontFamily: 'Georgia, serif',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #c026d3 50%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                  Zosouq
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* All Categories link */}
            <div className="px-4 pt-4">
              <Link to="/categories"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/categories'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 bg-gray-50 hover:shadow-md'
                }`}>
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  location.pathname === '/categories' ? 'bg-white/20' : 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md'
                }`}>
                  <LayoutGrid className="w-4 h-4" />
                </span>
                <span>All Categories</span>
              </Link>
            </div>

            {/* Category cards */}
            <div className="p-4 pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Shop by Category</p>
              <div className="space-y-2">
                {categories.map(cat => {
                  const colorClass = CAT_COLORS[cat.slug] || 'from-gray-500 to-gray-600'
                  const navImg = CAT_NAV_IMGS[cat.slug]
                  const subtleBg = CAT_SUBTLE_BG[cat.slug] || 'bg-gray-50'
                  const active = location.pathname === `/category/${cat.slug}`
                  return (
                    <Link key={cat.id} to={`/category/${cat.slug}`}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r ' + colorClass + ' text-white shadow-lg'
                          : subtleBg + ' text-gray-700 hover:shadow-md'
                      }`}>
                      <div className={`w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-sm ${active ? 'ring-2 ring-white/30' : 'ring-1 ring-black/5'}`}>
                        <img src={navImg} alt="" className={`w-full h-full object-cover ${cat.slug === 'hair-care' ? 'object-top' : ''}`} />
                      </div>
                      <span>{cat.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* My Orders link in mobile sidebar */}
            <div className="px-4 pb-4 border-t border-gray-100 pt-4">
              <Link to="/my-orders"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/my-orders'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 bg-gray-50 hover:shadow-md'
                }`}>
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  location.pathname === '/my-orders' ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md'
                }`}>
                  <Package className="w-4 h-4" />
                </span>
                <span>My Orders</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
