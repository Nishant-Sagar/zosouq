import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Star, ChevronLeft, Package, Truck, Shield, Minus, Plus, CheckCircle, ChevronRight } from 'lucide-react'
import { getProduct, getProducts } from '../api'
import { useCart, useToast } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import { formatPrice } from '../utils/format'

function Stars({ rating, size = 'md' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${cls} ${
            i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
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
  const addToast = useToast()

  useEffect(() => {
    setLoading(true)
    setAdded(false)
    setQty(1)
    setActiveImg(0)
    getProduct(slug).then(p => {
      setProduct(p)
      if (p.category?.slug) {
        getProducts({ category_slug: p.category.slug, limit: 4 }).then(setRelated)
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid lg:grid-cols-2 gap-12">
          <div className="bg-slate-200 rounded-2xl aspect-square" />
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="space-y-2 mt-6">
              {Array(4).fill(0).map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-6xl mb-4">🔍</p>
        <h3 className="text-xl font-semibold mb-4">Product not found</h3>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/category/${product.category.slug}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Back button */}
      <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm text-slate-600 hover:text-primary-600 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Main Product */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
        {/* Image Gallery */}
        <div className="flex flex-col gap-3">
          {/* Main image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-lg">
            <img
              src={allImages[activeImg] || `https://picsum.photos/seed/${product.slug}/600/600`}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-200"
              onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/600/600` }}
            />
            {discount && (
              <div className="absolute top-4 left-4 badge bg-red-500 text-white text-sm px-3 py-1.5">
                {discount}% OFF
              </div>
            )}
            {/* Prev / Next arrows when multiple images */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === activeImg ? 'bg-primary-600' : 'bg-white/60'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeImg ? 'border-primary-600 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
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

        {/* Details */}
        <div className="flex flex-col">
          {product.brand && (
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-2">{product.brand}</p>
          )}
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-5">
            <Stars rating={product.rating} size="lg" />
            <span className="text-base font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400">|</span>
            <span className="text-sm text-slate-500">{product.review_count.toLocaleString()} reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-extrabold text-slate-900">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-xl text-slate-400 line-through">{formatPrice(product.original_price)}</span>
            )}
            {discount && (
              <span className="badge bg-red-100 text-red-600 text-sm px-3 py-1">Save {discount}%</span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">
                  {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-red-500">Out of Stock</span>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-600 leading-relaxed mb-8 text-sm">{product.description}</p>

          {/* Qty + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-slate-900">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-base transition-all active:scale-95 ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {added ? (
                  <><CheckCircle className="w-5 h-5" /> Added to Cart!</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                )}
              </button>
            </div>
          )}

          <Link to="/cart" className="btn-secondary justify-center text-base mb-8">
            View Cart & Checkout
          </Link>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            {[
              { icon: Truck, title: 'Free Delivery', sub: 'Nationwide' },
              { icon: Package, title: 'Cash on Delivery', sub: 'Pay on arrival' },
              { icon: Shield, title: 'Secure', sub: '100% safe' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="text-center">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-xs font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="section-title mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.filter(p => p.slug !== slug).slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
