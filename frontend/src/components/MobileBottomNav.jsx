import { Link, useLocation } from 'react-router-dom'
import { Home, Heart, Grid3X3, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useLanguage } from '../context/LanguageContext'

const NAV_ITEMS = [
  { to: '/', icon: Home, labelKey: 'home' },
  { to: '/categories', icon: Grid3X3, labelKey: 'categories' },
  { to: '/wishlist', icon: Heart, labelKey: 'wishlist', showWishlistBadge: true },
  { to: '/cart', icon: ShoppingBag, labelKey: 'cart', showBadge: true },
]

export default function MobileBottomNav() {
  const location = useLocation()
  const { totalItems } = useCart()
  const { totalWishlist } = useWishlist()
  const { t } = useLanguage()

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    if (to === '/categories') return location.pathname.startsWith('/categor')
    return location.pathname.startsWith(to)
  }

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 mobile-bottom-nav" style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey, showBadge, showWishlistBadge }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-16 py-1.5 rounded-2xl transition-all duration-300 ${
                active
                  ? 'text-pink-600 scale-105'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* Active pill background */}
              {active && (
                <span className="absolute inset-0 bg-pink-50 rounded-2xl -z-10 animate-fade-in" />
              )}

              <span className="relative">
                <Icon
                  className={`w-[22px] h-[22px] transition-all duration-300 ${
                    active ? 'stroke-[2.5]' : 'stroke-[1.5]'
                  }`}
                  fill={active ? 'rgba(236,72,153,0.12)' : 'none'}
                />
                {/* Cart badge */}
                {showBadge && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-pink-200 animate-bounce-subtle">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
                {/* Wishlist badge */}
                {showWishlistBadge && totalWishlist > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-pink-200 animate-bounce-subtle">
                    {totalWishlist > 99 ? '99+' : totalWishlist}
                  </span>
                )}
              </span>

              <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${
                active ? 'text-pink-600' : ''
              }`}>
                {t(labelKey)}
              </span>

              {/* Active dot indicator */}
              {active && (
                <span className="absolute -bottom-0.5 w-1 h-1 bg-pink-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
