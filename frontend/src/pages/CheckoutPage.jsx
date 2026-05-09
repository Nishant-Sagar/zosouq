import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Truck, ChevronRight, AlertCircle } from 'lucide-react'
import { useCart, useToast } from '../context/CartContext'
import { createOrder } from '../api'
import { formatPrice } from '../utils/format'

const FIELDS = [
  { name: 'customer_name', label: 'Full Name', placeholder: 'John Doe', type: 'text', required: true },
  { name: 'customer_email', label: 'Email Address', placeholder: 'john@example.com', type: 'email', required: true },
  { name: 'customer_phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', required: true },
  { name: 'address', label: 'Delivery Address', placeholder: '123 Main Street, Apt 4B', type: 'text', required: true },
  { name: 'city', label: 'City', placeholder: 'New York', type: 'text', required: true },
  { name: 'notes', label: 'Order Notes (optional)', placeholder: 'Any special instructions...', type: 'textarea', required: false },
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

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/" className="btn-primary">Shop Now</Link>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/cart" className="hover:text-primary-600">Cart</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-600" />
                Delivery Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {FIELDS.map(field => (
                  <div key={field.name} className={field.name === 'address' || field.name === 'notes' ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        placeholder={field.placeholder}
                        value={form[field.name]}
                        onChange={e => {
                          setForm({ ...form, [field.name]: e.target.value })
                          setErrors({ ...errors, [field.name]: '' })
                        }}
                        className={`input-field resize-none ${errors[field.name] ? 'ring-2 ring-red-400 border-red-400' : ''}`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.name]}
                        onChange={e => {
                          setForm({ ...form, [field.name]: e.target.value })
                          setErrors({ ...errors, [field.name]: '' })
                        }}
                        className={`input-field ${errors[field.name] ? 'ring-2 ring-red-400 border-red-400' : ''}`}
                      />
                    )}
                    {errors[field.name] && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Method</h2>
              <div className="flex items-center gap-4 p-4 bg-primary-50 border-2 border-primary-300 rounded-xl">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">💵</div>
                <div>
                  <p className="font-semibold text-primary-800">Cash on Delivery</p>
                  <p className="text-sm text-primary-600">Pay when your order arrives at your door</p>
                </div>
                <div className="ml-auto w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                No advance payment needed. Pay cash when your items are delivered.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/100/100` }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-extrabold text-primary-600">{formatPrice(totalPrice)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </span>
                ) : (
                  'Place Order — Cash on Delivery'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
