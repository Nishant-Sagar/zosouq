import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles, Star, Share2, ShoppingBag, X } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart, useToast } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import SEO from '../components/SEO'

export default function WishlistPage() {
  const { items, dispatch: wishlistDispatch } = useWishlist()
  const { dispatch: cartDispatch } = useCart()
  const addToast = useToast()
  const [removingId, setRemovingId] = useState(null)

  const handleRemove = (id, name) => {
    setRemovingId(id)
    setTimeout(() => {
      wishlistDispatch({ type: 'REMOVE', payload: id })
      addToast(`${name} removed from wishlist`)
      setRemovingId(null)
    }, 300)
  }

  const handleMoveToCart = (product) => {
    cartDispatch({ type: 'ADD_ITEM', payload: product })
    wishlistDispatch({ type: 'REMOVE', payload: product.id })
    addToast(`${product.name} moved to cart`)
  }

  const handleMoveAllToCart = () => {
    const available = items.filter(p => p.stock !== 0)
    available.forEach(product => {
      cartDispatch({ type: 'ADD_ITEM', payload: product })
      wishlistDispatch({ type: 'REMOVE', payload: product.id })
    })
    addToast(`${available.length} item${available.length !== 1 ? 's' : ''} moved to cart`)
  }

  const handleClearAll = () => {
    wishlistDispatch({ type: 'CLEAR' })
    addToast('Wishlist cleared')
  }

  const totalSavings = items.reduce((sum, p) => {
    if (p.original_price) return sum + (p.original_price - p.price)
    return sum
  }, 0)

  /* ═══ EMPTY STATE ═══ */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <SEO title="My Wishlist" noIndex={true} path="/wishlist" />
        {/* Poster header even when empty */}
        <section className="pt-4 sm:pt-6 pb-2">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3 sm:mb-4">
              <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Wishlist</span>
            </nav>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #fdf2f8, #fce7f3, #fbcfe8)' }}>
              <div className="flex items-center justify-center py-10 sm:py-14">
                <div className="text-center px-6">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg shadow-pink-100">
                    <Heart className="w-9 h-9 sm:w-12 sm:h-12 text-pink-400" />
                  </div>
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    Your Wishlist is Empty
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6 max-w-sm mx-auto">
                    Tap the heart icon on any product to save it here. Your favorites will be waiting for you.
                  </p>
                  <Link to="/"
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg hover:gap-3 active:scale-95">
                    <Sparkles className="w-4 h-4" /> Start Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  /* ═══ MAIN WISHLIST ═══ */
  return (
    <div className="min-h-screen bg-gray-50/50">
      <SEO title="My Wishlist" noIndex={true} path="/wishlist" />

      {/* ═══ POSTER HEADER ═══ */}
      <section className="pt-4 sm:pt-6 pb-2">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3 sm:mb-4">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Wishlist</span>
          </nav>

          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #4c1d95)' }}>
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-6 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 left-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-pink-400/40 rounded-full" />
              <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-violet-400/30 rounded-full" />
            </div>

            <div className="relative px-5 sm:px-12 py-8 sm:py-10 w-full">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-4xl font-bold text-white mb-1.5 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                      My Wishlist
                    </h1>
                    <p className="text-white/50 text-xs sm:text-sm max-w-md">
                      Your curated collection of favorites, ready to shop whenever you are.
                    </p>
                  </div>

                  {/* Subtle inline stats */}
                  <div className="flex items-center gap-4 text-white/60 text-xs sm:text-sm">
                    <span><span className="text-white font-semibold">{items.length}</span> item{items.length !== 1 ? 's' : ''}</span>
                    {totalSavings > 0 && (
                      <>
                        <span className="w-px h-3.5 bg-white/20" />
                        <span>Saving <span className="text-emerald-400 font-semibold">{formatPrice(totalSavings)}</span></span>
                      </>
                    )}
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* ═══ ACTION BAR ═══ */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            <p className="text-sm text-gray-500">
              {items.length} item{items.length !== 1 ? 's' : ''} in your wishlist
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleMoveAllToCart}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md shadow-pink-200/50 transition-all hover:shadow-lg active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Move All to Cart</span>
                <span className="sm:hidden">Move All</span>
              </button>
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-500 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT GRID ═══ */}
      <section className="py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {items.map(product => {
              const discount = product.original_price
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : null

              return (
                <div key={product.id}
                  className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-pink-50 hover:border-pink-100 ${
                    removingId === product.id ? 'opacity-0 scale-95' : ''
                  }`}
                >
                  {/* Image */}
                  <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={product.image_url || `https://picsum.photos/seed/${product.slug}/400/400`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy" decoding="async"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/400/400` }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                    {/* Discount badge */}
                    {discount && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-md">
                        -{discount}%
                      </span>
                    )}

                    {/* Stock badge */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg">Out of Stock</span>
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={e => { e.preventDefault(); handleRemove(product.id, product.name) }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-pink-500 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    {product.brand && (
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-pink-400 mb-1">
                        {product.brand}
                      </p>
                    )}
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug hover:text-pink-600 transition-colors mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-medium text-gray-500">{product.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className={`font-bold text-sm sm:text-base ${discount ? 'text-pink-600' : 'text-gray-900'}`}>
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>

                    {/* Move to cart */}
                    <button
                      onClick={() => handleMoveToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:shadow-md active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Move to Cart
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ CONTINUE SHOPPING ═══ */}
      <section className="pb-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
          <Link to="/"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg hover:gap-3 active:scale-95">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
