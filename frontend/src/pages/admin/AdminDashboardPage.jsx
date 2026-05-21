import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag, DollarSign, Clock, CheckCircle, Truck, XCircle,
  Search, ChevronLeft, ChevronRight, LogOut, RefreshCw,
  Package, User, Phone, MapPin, Calendar, Filter, X,
  TrendingUp, ArrowUpRight, Eye, ChevronDown,
} from 'lucide-react'
import { adminGetStats, adminGetOrders, adminUpdateOrderStatus } from '../../api/admin'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',   dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',      dot: 'bg-blue-400' },
  shipped:   { label: 'Shipped',   color: 'bg-purple-500/15 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
  delivered: { label: 'Delivered', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/15 text-red-400 border-red-500/20',         dot: 'bg-red-400' },
}

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend != null && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            <ArrowUpRight className={`w-3.5 h-3.5 ${trend < 0 ? 'rotate-90' : ''}`} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function StatusDropdown({ orderId, currentStatus, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = async (status) => {
    if (status === currentStatus) { setOpen(false); return }
    setLoading(true)
    try {
      await onUpdate(orderId, status)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:border-gray-600 transition-all disabled:opacity-50"
      >
        {loading ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronDown className="w-3 h-3" />}
        Update
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-1 min-w-[140px]">
            {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
              <button
                key={s}
                onClick={() => update(s)}
                className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 transition-colors ${
                  s === currentStatus ? 'text-white font-semibold bg-gray-700/50' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s]?.dot}`} />
                {STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  if (!order) return null
  const fmt = (n) => `KD ${Number(n).toFixed(3)}`
  const fmtDate = (d) => new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-lg h-full bg-gray-900 border-l border-gray-800 overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Order Details</p>
            <p className="text-base font-bold text-white font-mono">{order.order_number}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + date */}
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <StatusDropdown orderId={order.id} currentStatus={order.status} onUpdate={onStatusUpdate} />
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {fmtDate(order.created_at)}
          </p>

          {/* Customer */}
          <div className="bg-gray-800/50 border border-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-white">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-300">{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">@</span>
              <span className="text-sm text-gray-300">{order.customer_email}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <span className="text-sm text-gray-300">{order.address}, {order.city}</span>
            </div>
            {order.notes && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
                Note: {order.notes}
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Items ({order.items.length})
            </p>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium line-clamp-1">
                      {item.product_name || 'Product'}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {fmt(item.price)}</p>
                  </div>
                  <p className="text-sm font-semibold text-white flex-shrink-0">
                    {fmt(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-800/50 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-300">{fmt(order.total_amount - (order.shipping_fee || 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              {(order.shipping_fee || 0) === 0
                ? <span className="text-emerald-400 font-semibold">FREE</span>
                : <span className="text-gray-300">{fmt(order.shipping_fee)}</span>
              }
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
              <span className="font-bold text-white">Total</span>
              <span className="font-bold text-white text-base">{fmt(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Payment</span>
              <span className="text-gray-400">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem('admin_username') || 'admin'

  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('newest')

  const PER_PAGE = 25

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await adminGetStats()
      setStats(data)
    } catch {}
    finally { setStatsLoading(false) }
  }, [])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: PER_PAGE, sort }
      if (statusFilter !== 'all') params.status = statusFilter
      if (search) params.search = search
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const data = await adminGetOrders(params)
      setOrders(data.orders)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch {}
    finally { setLoading(false) }
  }, [page, statusFilter, search, dateFrom, dateTo, sort])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { navigate('/admin/login', { replace: true }); return }
    loadStats()
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    navigate('/admin/login', { replace: true })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleStatusFilter = (s) => {
    setStatusFilter(s)
    setPage(1)
  }

  const handleStatusUpdate = async (orderId, status) => {
    await adminUpdateOrderStatus(orderId, status)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    if (selectedOrder?.id === orderId) setSelectedOrder(o => ({ ...o, status }))
    loadStats()
  }

  const clearFilters = () => {
    setSearch(''); setSearchInput(''); setStatusFilter('all')
    setDateFrom(''); setDateTo(''); setSort('newest'); setPage(1)
  }

  const hasFilters = search || statusFilter !== 'all' || dateFrom || dateTo || sort !== 'newest'
  const fmt = (n) => `KD ${Number(n || 0).toFixed(3)}`
  const fmtDate = (d) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top nav */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M3.5 4H16.5L3.5 16H16.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-300">Zosouq</span>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-gray-400">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { loadStats(); loadOrders() }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center text-xs font-bold">
                {username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-400 hidden sm:inline">{username}</span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats Grid */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Overview</h2>
          {statsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 animate-pulse h-24 sm:h-28" />
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              <StatCard icon={ShoppingBag} label="Total Orders" value={stats.total_orders.toLocaleString()} color="bg-blue-500/15 text-blue-400" />
              <StatCard icon={DollarSign} label="Total Revenue" value={fmt(stats.total_revenue)} color="bg-emerald-500/15 text-emerald-400" />
              <StatCard icon={TrendingUp} label="Today" value={stats.today_orders} sub={fmt(stats.today_revenue)} color="bg-violet-500/15 text-violet-400" />
              <StatCard icon={Clock} label="Pending" value={stats.pending_orders} color="bg-amber-500/15 text-amber-400" />
              <StatCard icon={Truck} label="Shipped" value={stats.shipped_orders} color="bg-purple-500/15 text-purple-400" />
              <StatCard icon={CheckCircle} label="Delivered" value={stats.delivered_orders} color="bg-emerald-500/15 text-emerald-400" />
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Table header + filters */}
          <div className="p-5 border-b border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Orders</h2>
                <p className="text-xs text-gray-500 mt-0.5">{total.toLocaleString()} total orders</p>
              </div>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition-all">
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>

            {/* Filter row */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 w-full sm:flex-1 sm:min-w-[200px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Order#, name, email, phone…"
                    className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40 focus:border-rose-500/40 transition-all"
                  />
                </div>
                <button type="submit"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-300 hover:border-gray-600 hover:text-white transition-all">
                  Search
                </button>
              </form>

              {/* Status tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => handleStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === s
                        ? 'bg-white text-gray-900 font-semibold'
                        : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600'
                    }`}>
                    {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}
                  </button>
                ))}
              </div>

              {/* Date range */}
              <div className="flex items-center gap-2 flex-wrap">
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                  className="flex-1 min-w-0 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-gray-500 [color-scheme:dark]" />
                <span className="text-gray-600 text-xs">–</span>
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
                  className="flex-1 min-w-0 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-gray-500 [color-scheme:dark]" />
              </div>

              {/* Sort */}
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-gray-500 [color-scheme:dark]">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Value</option>
                <option value="lowest">Lowest Value</option>
              </select>
            </div>
          </div>

          {/* Mobile: card list — hidden on md+ */}
          <div className="md:hidden divide-y divide-gray-800">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4 animate-pulse space-y-2">
                  <div className="h-3 bg-gray-800 rounded w-32" />
                  <div className="h-3 bg-gray-800 rounded w-48" />
                  <div className="h-3 bg-gray-800 rounded w-24" />
                </div>
              ))
            ) : orders.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No orders found</p>
              </div>
            ) : orders.map(order => (
              <div key={order.id} className="p-4 hover:bg-gray-800/40 active:bg-gray-800/60 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-mono text-xs font-bold text-white">{order.order_number}</p>
                    <p className="text-sm font-medium text-gray-200 mt-0.5">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.customer_phone} · {order.city}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    <span className="text-xs text-gray-600">{fmtDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{fmt(order.total_amount)}</span>
                    <button onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-white transition-all">
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <div onClick={e => e.stopPropagation()}>
                      <StatusDropdown orderId={order.id} currentStatus={order.status} onUpdate={handleStatusUpdate} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table — hidden on mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-gray-800/50 animate-pulse">
                      {Array(7).fill(0).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-800 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-gray-500">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} onClick={() => setSelectedOrder(order)}
                      className="border-b border-gray-800/50 hover:bg-gray-800/40 cursor-pointer transition-colors group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-white">{order.order_number}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-white text-xs">{order.customer_name}</p>
                        <p className="text-gray-500 text-xs">{order.customer_phone}</p>
                        <p className="text-gray-600 text-xs">{order.city}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-gray-400 text-xs">{fmtDate(order.created_at)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-400 text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-white text-xs">{fmt(order.total_amount)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all">
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <StatusDropdown orderId={order.id} currentStatus={order.status} onUpdate={handleStatusUpdate} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, total)} of {total.toLocaleString()} orders
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {(() => {
                  const pages = []
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i)
                  } else {
                    pages.push(1)
                    if (page > 3) pages.push('...')
                    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
                    if (page < totalPages - 2) pages.push('...')
                    pages.push(totalPages)
                  }
                  return pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xs">…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                          p === page ? 'bg-white text-gray-900' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}>
                        {p}
                      </button>
                    )
                  )
                })()}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order detail slide-over */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}
