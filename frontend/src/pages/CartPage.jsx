import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Shield, Sparkles, Truck } from 'lucide-react'
import { useCart, useToast } from '../context/CartContext'
import { formatPrice, calcShipping, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../utils/format'
import SEO from '../components/SEO'

export default function CartPage() {
  const { items, dispatch, totalPrice } = useCart()
  const addToast = useToast()

  const handleRemove = (item) => {
    dispatch({ type: 'REMOVE_ITEM', payload: item.id })
    addToast(`${item.name} removed from cart`, 'info')
  }

  const handleQty = (id, qty) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, qty } })
  }

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <section className="pt-4 sm:pt-6 pb-2">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3 sm:mb-4">
              <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Cart</span>
            </nav>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7, #bbf7d0)' }}>
              <div className="flex items-center justify-center py-10 sm:py-14">
                <div className="text-center px-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg shadow-emerald-100">
                    <ShoppingBag className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-500" />
                  </div>
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    Your Cart is Empty
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6 max-w-sm mx-auto">
                    Looks like you have not added anything yet. Start exploring our products!
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

  const subtotal = totalPrice
  const shipping = calcShipping(subtotal)
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SEO title="Your Cart" noIndex={true} />

      {/* ═══ BREADCRUMB ═══ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Cart</span>
        </nav>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5" style={{ fontFamily: 'Georgia, serif' }}>
          Shopping Cart <span className="text-gray-400 font-normal text-base">({totalQty} item{totalQty !== 1 ? 's' : ''})</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ═══ ITEMS LIST ═══ */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex gap-3 sm:gap-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50">
                    <img
                      src={item.image_url || `https://picsum.photos/seed/${item.slug}/200/200`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy" decoding="async"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/200/200` }}
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      {item.brand && (
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{item.brand}</p>
                      )}
                      <Link to={`/product/${item.slug}`}>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 hover:text-pink-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="w-8 sm:w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{formatPrice(item.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] sm:text-xs text-gray-400">{formatPrice(item.price)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => { dispatch({ type: 'CLEAR' }); addToast('Cart cleared', 'info') }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 mt-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear cart
            </button>
          </div>

          {/* ═══ ORDER SUMMARY ═══ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 sticky top-24">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({totalQty} items)</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Shipping
                  </span>
                  {shipping === 0
                    ? <span className="font-semibold text-emerald-600">FREE</span>
                    : <span className="font-semibold text-gray-900">{formatPrice(SHIPPING_FEE)}</span>
                  }
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-700">Cash on Delivery</span>
                </div>
              </div>

              {/* Free-shipping nudge */}
              {amountToFreeShipping > 0 && (
                <div className="mb-4 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <Truck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-snug">
                    Add <span className="font-bold">{formatPrice(amountToFreeShipping)}</span> more to get <span className="font-bold text-emerald-700">FREE shipping</span>!
                  </p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{formatPrice(subtotal + shipping)}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Inclusive of all taxes</p>
              </div>

              <Link to="/checkout"
                className="flex items-center justify-center gap-2 w-full py-3 sm:py-3.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-300 active:scale-[0.97]">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <Link to="/"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-900 hover:text-gray-900 transition-all mt-3">
                Continue Shopping
              </Link>

              {/* Trust info */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-gray-400">
                <Shield className="w-3.5 h-3.5" />
                <p className="text-[10px] sm:text-xs">
                  Secure checkout · Same-day delivery · Cash on delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
