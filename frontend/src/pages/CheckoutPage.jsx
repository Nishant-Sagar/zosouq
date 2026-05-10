import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Truck, AlertCircle, ShoppingBag, MapPin, CreditCard, User, Mail, Phone, FileText, Building, Shield, Lock, ChevronLeft, Sparkles, Tag, ChevronDown, ArrowRight } from 'lucide-react'
import { useCart, useToast } from '../context/CartContext'
import { createOrder } from '../api'
import { formatPrice } from '../utils/format'

const FIELDS = [
  { name: 'customer_name', label: 'Full Name', placeholder: 'Enter your full name', type: 'text', required: true, icon: User, half: true },
  { name: 'customer_phone', label: 'Phone Number', placeholder: '+965 XXXX XXXX', type: 'tel', required: true, icon: Phone, half: true },
  { name: 'customer_email', label: 'Email Address', placeholder: 'your@email.com', type: 'email', required: true, icon: Mail, half: false },
  { name: 'address', label: 'Delivery Address', placeholder: 'Street, building, floor, apartment...', type: 'text', required: true, icon: MapPin, half: false },
  { name: 'city', label: 'City', placeholder: 'e.g. Kuwait City', type: 'text', required: true, icon: Building, half: true },
  { name: 'notes', label: 'Order Notes', placeholder: 'Any special delivery instructions... (optional)', type: 'textarea', required: false, icon: FileText, half: false },
]

export default function CheckoutPage() {
  const { items, totalPrice, dispatch } = useCart()
  const addToast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    address: '', city: '', notes: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const summaryRef = useRef(null)

  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <section className="pt-4 sm:pt-6 pb-2">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3 sm:mb-4">
              <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Checkout</span>
            </nav>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3, #fde68a)' }}>
              <div className="flex items-center justify-center py-10 sm:py-14">
                <div className="text-center px-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg shadow-amber-100">
                    <ShoppingBag className="w-9 h-9 sm:w-11 sm:h-11 text-amber-500" />
                  </div>
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    Nothing to Checkout
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6 max-w-sm mx-auto">
                    Your cart is empty. Add some products first!
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

  const validate = () => {
    const errs = {}
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required'
    if (!form.customer_email.trim() || !/\S+@\S+\.\S+/.test(form.customer_email)) errs.customer_email = 'Valid email is required'
    if (!form.customer_phone.trim()) errs.customer_phone = 'Phone is required'
    if (!form.address.trim()) errs.address = 'Address is required'
    if (!form.city.trim()) errs.city = 'City is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setLoading(true)
    try {
      const order = await createOrder({
        ...form,
        items: items.map(item => ({ product_id: item.id, quantity: item.quantity, price: item.price })),
      })
      dispatch({ type: 'CLEAR' })
      navigate(`/order-confirmation/${order.order_number}`)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to place order. Please try again.'
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = 'w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all duration-200'
  const inputOk = 'border-gray-200 bg-white hover:border-gray-300'
  const inputErr = 'border-red-300 bg-red-50/50 ring-1 ring-red-200'

  return (
    <div className="min-h-screen bg-gray-50/50 pb-6">

      {/* ═══ BREADCRUMB ═══ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4 sm:mb-5">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-gray-700 transition-colors">Cart</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Checkout</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">

            {/* ═══ LEFT — FORM ═══ */}
            <div className="lg:col-span-3 space-y-5">

              {/* Page Title */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                  Checkout
                </h1>
                <Link to="/cart" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back to Cart
                </Link>
              </div>

              {/* Delivery Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Shipping Information</p>
                    <p className="text-[11px] text-gray-400">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-5 sm:py-6">
                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-5">
                    {FIELDS.map(field => {
                      const Icon = field.icon
                      return (
                        <div key={field.name} className={field.half ? '' : 'sm:col-span-2'}>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-0.5">*</span>}
                          </label>
                          <div className="relative">
                            <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors[field.name] ? 'text-red-400' : 'text-gray-400'} ${field.type === 'textarea' ? '!top-3.5 !translate-y-0' : ''}`} />
                            {field.type === 'textarea' ? (
                              <textarea
                                rows={3}
                                placeholder={field.placeholder}
                                value={form[field.name]}
                                onChange={e => {
                                  setForm({ ...form, [field.name]: e.target.value })
                                  if (errors[field.name]) setErrors({ ...errors, [field.name]: '' })
                                }}
                                className={`${inputBase} ${errors[field.name] ? inputErr : inputOk} resize-none`}
                              />
                            ) : (
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={form[field.name]}
                                onChange={e => {
                                  setForm({ ...form, [field.name]: e.target.value })
                                  if (errors[field.name]) setErrors({ ...errors, [field.name]: '' })
                                }}
                                className={`${inputBase} ${errors[field.name] ? inputErr : inputOk}`}
                              />
                            )}
                          </div>
                          {errors[field.name] && (
                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                              <AlertCircle className="w-3 h-3" /> {errors[field.name]}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Payment Method</p>
                    <p className="text-[11px] text-gray-400">How would you like to pay?</p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-5">
                  <div className="flex items-center gap-4 p-4 bg-emerald-50/70 border-2 border-emerald-200 rounded-xl relative">
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold uppercase rounded-full tracking-wider">Selected</span>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
                      <span className="text-lg sm:text-xl font-black text-emerald-700">COD</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Cash on Delivery</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay cash when your order arrives</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    No advance payment needed. Pay when items are delivered.
                  </p>
                </div>
              </div>

              {/* ═══ MOBILE: View Order Summary Button ═══ */}
              <button
                type="button"
                onClick={() => {
                  const errs = validate()
                  if (Object.keys(errs).length > 0) {
                    setErrors(errs)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    return
                  }
                  setShowSummary(true)
                  setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                }}
                className={`lg:hidden w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] shadow-lg ${
                  showSummary
                    ? 'bg-gray-200 text-gray-500 shadow-none'
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-300'
                }`}
              >
                {showSummary ? 'Summary shown below' : <><ArrowRight className="w-4 h-4" /> View Order Summary</>}
              </button>
            </div>

            {/* ═══ RIGHT — ORDER SUMMARY ═══ */}
            <div ref={summaryRef} className={`lg:col-span-2 ${showSummary ? '' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* Summary Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 sm:px-6 py-4 border-b border-gray-50">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                      Order Summary
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">{totalQty} item{totalQty !== 1 ? 's' : ''} in your order</p>
                  </div>

                  {/* Item list */}
                  <div className="px-5 sm:px-6 py-4 space-y-3 max-h-72 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3 group">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/100/100` }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                          <p className="text-[11px] text-gray-400 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 flex-shrink-0 tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="px-5 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-100 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-700 tabular-nums">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Shipping
                      </span>
                      <span className="font-semibold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment</span>
                      <span className="font-medium text-gray-700">Cash on Delivery</span>
                    </div>
                    <div className="h-px bg-gray-200 my-1" />
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-gray-900 tabular-nums">{formatPrice(totalPrice)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Inclusive of all taxes</p>
                  </div>

                  {/* Place Order button — right inside the summary card */}
                  <div className="px-5 sm:px-6 py-5 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm sm:text-base py-3.5 sm:py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-300 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> Place Order — {formatPrice(totalPrice)}
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-gray-400 mt-3">
                      <Shield className="w-3.5 h-3.5" />
                      <p className="text-[10px] sm:text-xs">Secure checkout · Free delivery · Cash on delivery</p>
                    </div>
                  </div>
                </div>

                {/* Edit Cart Link */}
                <Link to="/cart" className="hidden lg:flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-900 hover:text-gray-900 transition-all">
                  <ChevronLeft className="w-4 h-4" /> Edit Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
