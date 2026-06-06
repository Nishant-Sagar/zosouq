import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCart, useToast } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useLanguage } from '../context/LanguageContext'
import { formatPrice } from '../utils/format'

function ProductCard({ product, compact, accentColor }) {
  const { dispatch } = useCart()
  const { dispatch: wishlistDispatch, isWishlisted } = useWishlist()
  const addToast = useToast()
  const { t } = useLanguage()
  const accent = accentColor || '#ec4899'
  const wishlisted = isWishlisted(product.id)

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch({ type: 'ADD_ITEM', payload: product })
    addToast(`${product.name} — ${t('added_to_cart')}`)
  }

  return (
    <Link to={`/product/${product.slug}`} className="group block h-full">
      <div className="product-card rounded-2xl overflow-hidden h-full flex flex-col bg-white border border-gray-100 hover:border-transparent hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300">

        {/* Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />

          {/* Discount badge */}
          {discount && (
            <span className="absolute top-2.5 left-2.5 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
              style={{ background: `linear-gradient(135deg, #ef4444, ${accent})` }}>
              -{discount}%
            </span>
          )}

          {/* Wishlist heart */}
          <button
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              wishlistDispatch({ type: 'TOGGLE', payload: product })
              addToast(wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`)
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md ${
              wishlisted
                ? 'bg-pink-50 opacity-100'
                : 'bg-white/80 opacity-0 group-hover:opacity-100 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${
              wishlisted ? 'text-pink-500 fill-pink-500 scale-110' : 'text-gray-500 hover:text-pink-500'
            }`} />
          </button>

          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-full">Sold Out</span>
            </div>
          )}

          {/* Quick add button */}
          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className="absolute bottom-2.5 left-2.5 right-2.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}>
            <ShoppingCart className="w-3.5 h-3.5" /> {t('add_to_cart')}
          </button>
        </div>

        {/* Info */}
        <div className={`flex flex-col flex-1 ${compact ? 'p-2.5' : 'p-3 sm:p-4'}`}>
          {product.brand && (
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: accent + 'aa' }}>
              {product.brand}
            </p>
          )}
          <h3 className={`font-medium text-gray-800 line-clamp-2 flex-1 mb-2 transition-colors duration-200 ${compact ? 'text-xs' : 'text-sm leading-snug'}`}
            style={{ '--hover-color': accent }}
          >
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 flex-wrap">
            {product.original_price && (
              <span className={`line-through text-gray-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {formatPrice(product.original_price)}
              </span>
            )}
            <span className={`font-bold ${compact ? 'text-sm' : 'text-base'}`}
              style={{ color: discount ? accent : '#111827' }}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default memo(ProductCard)
