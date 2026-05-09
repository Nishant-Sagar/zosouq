import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getCategories } from '../api'

export default function Navbar() {
  const { totalItems } = useCart()
  const [categories, setCategories] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { getCategories().then(setCategories).catch(() => {}) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery('') }
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}
      style={{ background: '#FFFDF8', borderBottom: '1px solid #F0E6CE' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-16">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex flex-col leading-none">
            <span className="text-xl font-bold tracking-widest uppercase"
              style={{ color: '#1A0800', fontFamily: 'Georgia, serif', letterSpacing: '0.15em' }}>
              Zosouq
            </span>
            <span className="text-xs tracking-widest uppercase" style={{ color: '#C8A43A', fontSize: '8px' }}>
              Luxury · Beauty · Fashion
            </span>
          </Link>

          {/* Category links */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: '#5C3A1E' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#B08C28'; e.currentTarget.style.background = '#FDF5E4' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#5C3A1E'; e.currentTarget.style.background = 'transparent' }}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xs ml-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#A08050' }} />
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg transition-all focus:outline-none"
                style={{ background: '#F5EDD0', border: '1px solid #E8D5A3', color: '#1A0800' }}
                onFocus={e => { e.target.style.borderColor = '#C8A43A'; e.target.style.background = '#FDF8EE' }}
                onBlur={e => { e.target.style.borderColor = '#E8D5A3'; e.target.style.background = '#F5EDD0' }}
              />
            </div>
          </form>

          {/* Cart + Mobile toggle */}
          <div className="flex items-center gap-1 ml-2">
            <Link to="/cart" className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
              style={{ color: '#1A0800' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5EDD0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-white text-xs font-bold rounded-full flex items-center justify-center px-1"
                  style={{ background: '#C8A43A', color: '#1A0800', fontSize: '10px' }}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
              style={{ color: '#1A0800' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5EDD0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#A08050' }} />
            <input type="text" placeholder="Search products…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none"
              style={{ background: '#F5EDD0', border: '1px solid #E8D5A3', color: '#1A0800' }}
            />
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden" style={{ borderTop: '1px solid #F0E6CE', background: '#FFFDF8' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: '#FDF5E4', border: '1px solid #F0E6CE', color: '#5C3A1E' }}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
