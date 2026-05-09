import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useCart, useToast } from '../context/CartContext'
import { formatPrice } from '../utils/format'

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`} />
      ))}
    </div>
  )
}

export default function ProductCard({ product }) {
  const { dispatch } = useCart()
  const addToast = useToast()

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch({ type: 'ADD_ITEM', payload: product })
    addToast(`${product.name} added to cart`)
  }

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
        style={{ background: '#fff', border: '1px solid #F0E6CE' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,164,58,0.4)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#F0E6CE'}
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-stone-50 aspect-square">
          <img
            src={product.image_url || `https://picsum.photos/seed/${product.slug}/400/400`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/400/400` }}
          />
          {discount && (
            <span className="absolute top-3 left-3 badge text-white text-xs px-2 py-1"
              style={{ background: '#B08C28' }}>
              -{discount}%
            </span>
          )}
          {!discount && product.is_featured && (
            <span className="absolute top-3 left-3 badge text-xs px-2 py-1"
              style={{ background: '#1A0800', color: '#C8A43A', border: '1px solid rgba(200,164,58,0.4)' }}>
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="badge bg-white text-stone-700 text-sm px-4 py-1.5">Out of Stock</span>
            </div>
          )}
          {/* Quick add overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ background: '#1A0800', border: '1px solid rgba(200,164,58,0.5)' }}
              onMouseEnter={e => { if (product.stock > 0) e.currentTarget.style.background = '#C8A43A'; e.currentTarget.style.color = '#1A0800' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1A0800'; e.currentTarget.style.color = '#fff' }}
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          {product.brand && (
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#C8A43A' }}>
              {product.brand}
            </p>
          )}
          <h3 className="text-sm font-semibold line-clamp-2 flex-1 mb-2 transition-colors group-hover:text-amber-700"
            style={{ color: '#1A0800' }}>
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <Stars rating={product.rating} />
            <span className="text-xs text-stone-400">({product.review_count.toLocaleString()})</span>
          </div>
          <div>
            <span className="text-base font-bold" style={{ color: '#1A0800' }}>{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="ml-2 text-sm text-stone-400 line-through">{formatPrice(product.original_price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
