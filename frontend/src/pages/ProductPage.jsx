import { useEffect, useState, useMemo, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Star, ChevronLeft, Package, Truck, Shield, Minus, Plus, CheckCircle, ChevronRight, Heart, Share2, Sparkles } from 'lucide-react'
import { getProduct, getProducts, getReviews, submitReview } from '../api'
import { useCart, useToast } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'
import { formatPrice } from '../utils/format'
import SEO from '../components/SEO'

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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [lbDragX, setLbDragX] = useState(0)
  const [reviews, setReviews] = useState([])
  const [reviewName, setReviewName] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const touchStartX = useRef(null)
  const lbTouchStartX = useRef(null)
  const isDragging = useRef(false)

  const goTo = (i, total) => setActiveImg(((i % total) + total) % total)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    isDragging.current = false
  }
  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return
    const d = e.touches[0].clientX - touchStartX.current
    isDragging.current = true
    setDragX(d)
  }
  const handleTouchEnd = (e, total) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    setDragX(0)
    if (Math.abs(delta) > 40) goTo(activeImg + (delta > 0 ? 1 : -1), total)
    touchStartX.current = null
    isDragging.current = false
  }

  const handleLbTouchStart = (e) => { lbTouchStartX.current = e.touches[0].clientX }
  const handleLbTouchMove = (e) => {
    if (lbTouchStartX.current === null) return
    setLbDragX(e.touches[0].clientX - lbTouchStartX.current)
  }
  const handleLbTouchEnd = (e, total) => {
    if (lbTouchStartX.current === null) return
    const delta = lbTouchStartX.current - e.changedTouches[0].clientX
    setLbDragX(0)
    if (Math.abs(delta) > 40) goTo(activeImg + (delta > 0 ? 1 : -1), total)
    lbTouchStartX.current = null
  }

  const { dispatch } = useCart()
  const { dispatch: wishlistDispatch, isWishlisted } = useWishlist()
  const addToast = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    setLoading(true)
    setAdded(false)
    setQty(1)
    setActiveImg(0)
    getProduct(slug).then(p => {
      setProduct(p)
      if (p.category?.slug) {
        getProducts({ category_slug: p.category.slug, limit: 8 }).then(r => setRelated(Array.isArray(r) ? r : []))
      }
    }).catch(() => {}).finally(() => setLoading(false))
    getReviews(slug).then(r => setReviews(Array.isArray(r) ? r : [])).catch(() => {})
    window.scrollTo(0, 0)
  }, [slug])

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({ type: 'ADD_ITEM', payload: product })
    }
    setAdded(true)
    addToast(`${product.name} — ${t('added_to_cart')}`)
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
        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>{t('product_not_found')}</h3>
        <p className="text-gray-500 text-sm mb-6">{t('product_not_found_sub')}</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95">
          {t('back_home')}
        </Link>
      </div>
    )
  }

  const wishlisted = isWishlisted(product.id)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url || '',
    sku: String(product.id),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KWD',
      price: product.price.toFixed(3),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Zosouq' },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'KWD' },
        deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' } },
      },
    },
    ...(product.review_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SEO
        title={product.brand ? `${product.name} by ${product.brand}` : product.name}
        description={`Buy ${product.name}${product.brand ? ` by ${product.brand}` : ''} in Kuwait. ${product.description?.trim().slice(0, 120) || `Shop authentic ${product.category?.name || 'beauty'} products`}. KD ${product.price.toFixed(3)}. Same-day delivery across Kuwait. Free delivery over KD 10.`}
        keywords={[product.name, product.brand, product.category?.name, 'Kuwait', 'buy online', 'same-day delivery'].filter(Boolean).join(', ')}
        image={product.image_url?.startsWith('http') ? product.image_url : `https://www.zosouq.com${product.image_url}`}
        path={`/product/${product.slug}`}
        type="product"
        jsonLd={productJsonLd}
      />

      {/* ═══ BREADCRUMB ═══ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link to="/" className="hover:text-gray-700 transition-colors">{t('home')}</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`} className="hover:text-gray-700 transition-colors">
                {t(product.category.slug.replace(/-/g, '_'))}
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
            <div className="flex gap-3 min-w-0">

              {/* Vertical thumbnails — left side (desktop only) */}
              {allImages.length > 1 && (
                <div className="hidden sm:flex flex-col gap-2 flex-shrink-0 overflow-y-auto no-scrollbar" style={{ maxHeight: '480px' }}>
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-14 h-16 lg:w-16 lg:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                        i === activeImg
                          ? 'border-gray-900 shadow-md opacity-100'
                          : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        className="w-full h-full object-contain p-1"
                        loading="lazy" decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white select-none"
                  style={{ height: 'clamp(300px, 80vw, 480px)' }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={e => handleTouchEnd(e, allImages.length)}
                >
                  {/* Sliding strip */}
                  <div
                    className="flex h-full"
                    style={{
                      width: `${allImages.length * 100}%`,
                      transform: `translateX(calc(-${activeImg * (100 / allImages.length)}% + ${dragX / allImages.length}px))`,
                      transition: dragX !== 0 ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      willChange: 'transform',
                    }}
                  >
                    {allImages.map((img, i) => (
                      <div key={i} className="h-full flex-shrink-0 cursor-zoom-in p-4 sm:p-6" style={{ width: `${100 / allImages.length}%` }}
                        onClick={() => !isDragging.current && setLightboxOpen(true)}>
                        <img src={img} alt={`${product.name} ${i + 1}`}
                          className="w-full h-full object-contain"
                          loading={i === 0 ? 'eager' : 'lazy'}
                          fetchPriority={i === 0 ? 'high' : 'auto'}
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Discount badge */}
                  {discount && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-lg pointer-events-none">
                      -{discount}%
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={() => {
                      wishlistDispatch({ type: 'TOGGLE', payload: product })
                      addToast(wishlisted ? `${product.name} — ${t('removed_wishlist')}` : `${product.name} — ${t('added_wishlist')}`)
                    }}
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                      wishlisted ? 'bg-pink-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:text-pink-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
                  </button>

                  {/* Desktop nav arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button onClick={() => goTo(activeImg - 1, allImages.length)}
                        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button onClick={() => goTo(activeImg + 1, allImages.length)}
                        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile thumbnails — horizontal at bottom */}
                {allImages.length > 1 && (
                  <div className="flex sm:hidden gap-2 overflow-x-auto no-scrollbar pb-1 w-full">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 bg-white transition-all ${
                          i === activeImg ? 'border-gray-900 shadow-md' : 'border-gray-200 opacity-60'
                        }`}
                      >
                        <img src={img} alt={`${product.name} view ${i + 1}`}
                          className="w-full h-full object-contain p-1"
                          loading="lazy" decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Product Details ── */}
            <div className="flex flex-col py-1 lg:py-4">


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
                      {t('save_percent', { percent: discount })}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{t('inclusive_taxes')}</p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-5">
                {product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">
                      {product.stock > 10 ? t('in_stock') : t('low_stock', { n: product.stock })}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-medium text-red-500">{t('out_of_stock')}</span>
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
                        <><CheckCircle className="w-5 h-5" /> {t('added')}</>
                      ) : (
                        <><ShoppingCart className="w-5 h-5" /> {t('add_to_cart')}</>
                      )}
                    </button>
                  </div>

                  {/* Buy now link */}
                  <Link to="/cart"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-gray-900 text-gray-900 text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300">
                    {t('buy_now')}
                  </Link>
                </div>
              )}

              {/* Out of stock button */}
              {product.stock === 0 && (
                <button
                  onClick={() => {
                    wishlistDispatch({ type: 'TOGGLE', payload: product })
                    addToast(wishlisted ? `${product.name} — ${t('removed_wishlist')}` : `${product.name} — ${t('added_wishlist')}`)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-pink-300 text-pink-600 text-sm font-semibold hover:bg-pink-50 transition-all mb-6"
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-pink-500' : ''}`} />
                  {wishlisted ? t('saved_wishlist') : t('add_wishlist')}
                </button>
              )}

              {/* ── Trust Perks ── */}
              <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
                {[
                  { icon: Truck, labelKey: 'same_day' },
                  { icon: Package, labelKey: 'cash_on_delivery' },
                  { icon: Shield, labelKey: 'authentic' },
                ].map(({ icon: Icon, labelKey }) => (
                  <div key={labelKey} className="flex items-center gap-2 text-gray-500">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs font-medium">{t(labelKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="py-6 sm:py-8 bg-white border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-bold text-gray-900">{t('reviews')}</h2>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Stars rating={product.rating} />
              <span className="font-semibold text-gray-800">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.review_count})</span>
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left — Write a review */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5">
              {!reviewSubmitted ? (
                <>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">{t('write_review')}</h3>
                  {/* Stars */}
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 active:scale-95">
                        <svg width="28" height="28" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill={star <= (hoverRating || reviewRating) ? '#f59e0b' : '#e5e7eb'}
                            stroke={star <= (hoverRating || reviewRating) ? '#f59e0b' : '#d1d5db'}
                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="text-xs text-amber-600 font-medium self-center ml-1">
                        {['','Poor','Fair','Good','Very Good','Excellent'][reviewRating]}
                      </span>
                    )}
                  </div>
                  {/* Name + Comment inline */}
                  <input type="text" value={reviewName} onChange={e => setReviewName(e.target.value)}
                    placeholder={t('your_name')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm mb-2 focus:outline-none focus:border-pink-400 bg-white transition-all"/>
                  <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                    placeholder={t('share_experience')} rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:border-pink-400 bg-white transition-all resize-none"/>
                  <button
                    disabled={submitting || !reviewRating || !reviewName.trim()}
                    onClick={async () => {
                      if (!reviewRating || !reviewName.trim()) return
                      setSubmitting(true)
                      try {
                        const newReview = await submitReview(slug, {
                          reviewer_name: reviewName.trim(),
                          rating: reviewRating,
                          comment: reviewComment.trim() || null,
                        })
                        setReviews(prev => [newReview, ...prev])
                        setProduct(prev => ({
                          ...prev,
                          rating: ((prev.rating * prev.review_count) + reviewRating) / (prev.review_count + 1),
                          review_count: prev.review_count + 1,
                        }))
                        setReviewSubmitted(true)
                      } catch {
                        addToast('Failed to submit. Please try again.', 'error')
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                    className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                    {submitting ? t('submitting') : t('submit_review')}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('review_thanks')}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t('review_thanks_sub')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right — Review list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="mb-2 opacity-40">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-sm">{t('no_reviews')}</p>
                </div>
              ) : reviews.map(r => (
                <div key={r.id} className="border border-gray-100 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {r.reviewer_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{r.reviewer_name}</span>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment && <p className="text-xs text-gray-500 leading-relaxed ml-9">{r.comment}</p>}
                  <p className="text-[10px] text-gray-300 mt-1 ml-9">{new Date(r.created_at).toLocaleDateString('en-KW', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              ))}
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
                  {t('you_may_like')}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{t('more_from', { category: product.category ? t(product.category.slug.replace(/-/g, '_')) : t('collection') })}</p>
              </div>
              {product.category && (
                <Link to={`/category/${product.category.slug}`}
                  className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                  {t('view_all')} <ChevronRight className="w-4 h-4" />
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

      {/* ═══ LIGHTBOX ═══ */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-gradient-to-b from-black/60 to-transparent absolute top-0 left-0 right-0 z-10">
            <button onClick={() => setLightboxOpen(false)}
              className="flex items-center gap-1.5 text-white/80 hover:text-white active:scale-95 transition-all">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">{t('back')}</span>
            </button>
            <span className="text-white/60 text-sm font-medium">{activeImg + 1} / {allImages.length}</span>
            <button onClick={() => setLightboxOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Sliding image strip */}
          <div className="flex-1 overflow-hidden"
            onTouchStart={handleLbTouchStart}
            onTouchMove={handleLbTouchMove}
            onTouchEnd={e => handleLbTouchEnd(e, allImages.length)}
          >
            <div className="flex h-full items-center"
              style={{
                width: `${allImages.length * 100}%`,
                transform: `translateX(calc(-${activeImg * (100 / allImages.length)}% + ${lbDragX / allImages.length}px))`,
                transition: lbDragX !== 0 ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform',
              }}
            >
              {allImages.map((img, i) => (
                <div key={i} className="flex items-center justify-center px-2" style={{ width: `${100 / allImages.length}%`, height: '100%' }}>
                  <img src={img} alt={`${product.name} ${i + 1}`}
                    className="max-w-full max-h-full object-contain"
                    draggable={false}
                    loading={i === activeImg ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3 flex-shrink-0 no-scrollbar bg-gradient-to-t from-black/60 to-transparent">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    i === activeImg ? 'border-white scale-105' : 'border-transparent opacity-40 hover:opacity-70'
                  }`}>
                  <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
