import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Star, ChevronLeft, Package, Truck, Shield, Minus, Plus, CheckCircle, ChevronRight, Heart, Share2, Sparkles } from 'lucide-react'
import { getProduct, getProducts } from '../api'
import { useCart, useToast } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'
import { formatPrice } from '../utils/format'

function Stars({ rating, size = 'md' }) {
  const cls = size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${cls} ${
            i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const { dispatch } = useCart()
  const { dispatch: wishlistDispatch, isWishlisted } = useWishlist()
  const addToast = useToast()

  useEffect(() => {
    setLoading(true)
    setAdded(false)
    setQty(1)
    setActiveImg(0)
    getProduct(slug).then(p => {
      setProduct(p)
      if (p.category?.slug) {
        getProducts({ category_slug: p.category.slug, limit: 8 }).then(setRelated)
      }
    }).catch(() => {}).finally(() => setLoading(false))
    window.scrollTo(0, 0)
  }, [slug])

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({ type: 'ADD_ITEM', payload: product })
    }
    setAdded(true)
    addToast(`${product.name} added to cart`)
    setTimeout(() => setAdded(false), 2500)
  }

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  const allImages = useMemo(() => {
    if (!product) return []
    try {
      const parsed = product.images ? JSON.parse(product.images) : []
      return parsed.length > 0 ? parsed : (product.image_url ? [product.image_url] : [])
    } catch {
      return product.image_url ? [product.image_url] : []
    }
  }, [product])

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
          <div className="animate-pulse grid lg:grid-cols-2 gap-8 lg:gap-14">
            <div className="bg-gray-200 rounded-2xl sm:rounded-3xl aspect-square" />
            <div className="space-y-4 py-4">
              <div className="h-3 bg-gray-200 rounded-full w-20" />
              <div className="h-7 bg-gray-200 rounded-lg w-4/5" />
              <div className="h-5 bg-gray-200 rounded-lg w-1/3" />
              <div className="h-10 bg-gray-200 rounded-lg w-1/2 mt-4" />
              <div className="space-y-2 mt-6">
                {Array(3).fill(0).map((_, i) => <div key={i} className="h-3 bg-gray-200 rounded-full" />)}
              </div>
              <div className="h-12 bg-gray-200 rounded-xl w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <Sparkles className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>Product Not Found</h3>
        <p className="text-gray-500 text-sm mb-6">This product may have been removed or the link is incorrect.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95">
          Back to Home
        </Link>
      </div>
    )
  }

  const wishlisted = isWishlisted(product.id)

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* ═══ BREADCRUMB ═══ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`} className="hover:text-gray-700 transition-colors">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* ═══ MAIN PRODUCT SECTION ═══ */}
      <section className="py-4 sm:py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">

            {/* ── Image Gallery ── */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white group">
                <img
                  src={allImages[activeImg] || `https://picsum.photos/seed/${product.slug}/600/600`}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/600/600` }}
                />

                {/* Discount badge */}
                {discount && (
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl shadow-lg">
                    {discount}% OFF
                  </div>
                )}

                {/* Wishlist button on image */}
                <button
                  onClick={() => {
                    wishlistDispatch({ type: 'TOGGLE', payload: product })
                    addToast(wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`)
                  }}
                  className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                    wishlisted
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:text-pink-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
                </button>

                {/* Prev / Next arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-white w-4' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        i === activeImg ? 'border-gray-900 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = `https://picsum.photos/seed/${product.id + i}/100/100` }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Details ── */}
            <div className="flex flex-col py-1 lg:py-4">

              {/* Brand */}
              {product.brand && (
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{product.brand}</p>
              )}

              {/* Name */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2.5 mb-5">
                <Stars rating={product.rating} size="lg" />
                <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                <span className="w-px h-4 bg-gray-200" />
                <span className="text-xs text-gray-400">{product.review_count.toLocaleString()} reviews</span>
              </div>

              {/* Price block */}
              <div className="bg-gray-50 rounded-2xl px-5 py-4 mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{formatPrice(product.price)}</span>
                  {product.original_price && (
                    <span className="text-base text-gray-400 line-through">{formatPrice(product.original_price)}</span>
                  )}
                  {discount && (
                    <span className="bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg">
                      Save {discount}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-5">
                {product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">
                      {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-medium text-red-500">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>

              {/* ── Qty + Add to Cart ── */}
              {product.stock > 0 && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    {/* Qty selector */}
                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-10 sm:w-12 text-center font-semibold text-gray-900 text-sm">{qty}</span>
                      <button
                        onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all active:scale-[0.97] shadow-lg ${
                        added
                          ? 'bg-emerald-500 text-white shadow-emerald-200'
                          : 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-300'
                      }`}
                    >
                      {added ? (
                        <><CheckCircle className="w-5 h-5" /> Added!</>
                      ) : (
                        <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                      )}
                    </button>
                  </div>

                  {/* Buy now link */}
                  <Link to="/cart"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-gray-900 text-gray-900 text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300">
                    Buy Now
                  </Link>
                </div>
              )}

              {/* Out of stock button */}
              {product.stock === 0 && (
                <button
                  onClick={() => {
                    wishlistDispatch({ type: 'TOGGLE', payload: product })
                    addToast(wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-pink-300 text-pink-600 text-sm font-semibold hover:bg-pink-50 transition-all mb-6"
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-pink-500' : ''}`} />
                  {wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </button>
              )}

              {/* ── Trust Perks ── */}
              <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
                {[
                  { icon: Truck, label: 'Free Delivery' },
                  { icon: Package, label: 'Cash on Delivery' },
                  { icon: Shield, label: '100% Authentic' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-gray-500">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RELATED PRODUCTS ═══ */}
      {related.filter(p => p.slug !== slug).length > 0 && (
        <section className="py-6 sm:py-10 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                  You May Also Like
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">More from {product.category?.name || 'this collection'}</p>
              </div>
              {product.category && (
                <Link to={`/category/${product.category.slug}`}
                  className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {related.filter(p => p.slug !== slug).slice(0, 5).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
