import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Search, Mail, Clock, ChevronRight, ShoppingBag, Sparkles, AlertCircle, Truck, CheckCircle, Hash } from 'lucide-react'
import { searchOrders, getOrder } from '../api'
import { formatPrice } from '../utils/format'

const STATUS_MAP = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export default function MyOrdersPage() {
  const [mode, setMode] = useState('email') // 'email' | 'order'
  const [email, setEmail] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setOrders(null)

    if (mode === 'email') {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address')
        return
      }
      setLoading(true)
      try {
        const data = await searchOrders({ email: email.trim() })
        setOrders(data)
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      if (!orderNumber.trim()) {
        setError('Please enter an order number')
        return
      }
      setLoading(true)
      try {
        const data = await getOrder(orderNumber.trim().toUpperCase())
        setOrders([data])
      } catch (err) {
        if (err?.response?.status === 404) {
          setOrders([])
        } else {
          setError('Something went wrong. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3 sm:mb-4">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">My Orders</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-6 sm:mb-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe, #c4b5fd)' }}>
          <div className="py-8 sm:py-12 px-6 sm:px-10 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg shadow-purple-200">
              <Package className="w-7 h-7 sm:w-9 sm:h-9 text-purple-600" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1.5" style={{ fontFamily: 'Georgia, serif' }}>
              My Orders
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto">
              Track your orders by entering your email address or order number
            </p>
          </div>
        </div>
      </div>

      {/* Search Card */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Mode Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => { setMode('email'); setError(''); setOrders(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all ${
                mode === 'email'
                  ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50/50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Mail className="w-4 h-4" /> Search by Email
            </button>
            <button
              type="button"
              onClick={() => { setMode('order'); setError(''); setOrders(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all ${
                mode === 'order'
                  ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50/50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Hash className="w-4 h-4" /> Search by Order #
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="p-5 sm:p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                {mode === 'email' ? (
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                ) : (
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
                <input
                  type={mode === 'email' ? 'email' : 'text'}
                  placeholder={mode === 'email' ? 'Enter your email address' : 'e.g. ORD-ABC12345'}
                  value={mode === 'email' ? email : orderNumber}
                  onChange={e => mode === 'email' ? setEmail(e.target.value) : setOrderNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all hover:border-gray-300"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex-shrink-0 flex items-center gap-2 bg-gray-900 text-white px-5 sm:px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
          </form>
        </div>

        {/* Results */}
        {orders !== null && (
          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5" style={{ fontFamily: 'Georgia, serif' }}>
                  No orders found
                </h3>
                <p className="text-gray-500 text-sm mb-5">
                  {mode === 'email'
                    ? "We couldn't find any orders with this email address."
                    : "We couldn't find an order with this number."}
                </p>
                <Link to="/"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-800 transition-all active:scale-95">
                  <Sparkles className="w-4 h-4" /> Start Shopping
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 font-medium px-1">
                  {orders.length} order{orders.length !== 1 ? 's' : ''} found
                </p>
                {orders.map(order => {
                  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
                  const StatusIcon = statusInfo.icon
                  return (
                    <Link
                      key={order.id}
                      to={`/order-confirmation/${order.order_number}`}
                      className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden group"
                    >
                      {/* Order header */}
                      <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 font-mono">{order.order_number}</p>
                            <p className="text-[11px] text-gray-400">{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>

                      {/* Order items preview */}
                      <div className="px-5 sm:px-6 py-4">
                        <div className="flex items-center gap-2 mb-3">
                          {order.items.slice(0, 4).map((item, i) => (
                            <div key={i} className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                              {item.product ? (
                                <img src={item.product.image_url} alt="" className="w-full h-full object-cover"
                                  onError={e => { e.target.src = `https://picsum.photos/seed/${item.product_id}/100/100` }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : order.payment_method}
                          </p>
                          <p className="text-base font-extrabold text-gray-900 tabular-nums">{formatPrice(order.total_amount)}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  )
}
