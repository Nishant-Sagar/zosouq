import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useCart, useToast } from '../context/CartContext'
import { formatPrice } from '../utils/format'

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

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven't added anything yet. Start exploring our products!</p>
          <Link to="/" className="btn-primary text-base px-8 py-4">
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  const shipping = 0
  const subtotal = totalPrice

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4 animate-fade-in">
              <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={item.image_url || `https://picsum.photos/seed/${item.slug}/200/200`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/200/200` }}
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    {item.brand && (
                      <p className="text-xs text-primary-600 font-semibold mb-0.5">{item.brand}</p>
                    )}
                    <Link to={`/product/${item.slug}`}>
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate hover:text-primary-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQty(item.id, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQty(item.id, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-slate-400">{formatPrice(item.price)} each</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => { dispatch({ type: 'CLEAR' }); addToast('Cart cleared', 'info') }}
            className="text-sm text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1 mt-2"
          >
            <Trash2 className="w-4 h-4" /> Clear cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Shipping
                </span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Payment</span>
                <span className="font-medium text-slate-700">Cash on Delivery</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-extrabold text-primary-600">{formatPrice(subtotal + shipping)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary w-full justify-center text-base py-4">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Link>

            <Link to="/" className="block text-center text-sm text-slate-500 hover:text-primary-600 mt-4 transition-colors">
              Continue Shopping
            </Link>

            {/* Secure badge */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                🔒 Secure checkout · Free delivery · Cash on delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
