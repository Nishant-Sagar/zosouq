import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Truck, AlertCircle, ShoppingBag, CreditCard, User, Mail, Phone, FileText, Shield, Lock, ChevronLeft, Sparkles, Tag, ChevronDown, ArrowRight, MapPin, Hash, Building2, Layers } from 'lucide-react'
import { useCart, useToast } from '../context/CartContext'
import { createOrder } from '../api'
import { formatPrice, calcShipping, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../utils/format'
import SEO from '../components/SEO'

/* ── Kuwait address data ── */
const GOVERNORATES = ['Capital', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra']

const AREAS_BY_GOV = {
  'Capital': ['Kuwait City', 'Sharq', 'Mirqab', 'Mubarakiya', 'Dasman', 'Bnaid Al-Gar', 'Qibla', 'Shamiya', 'Shuwaikh Industrial', 'Shuwaikh Residential', 'Sulaibikhat', 'Rai', 'Nahdha'],
  'Hawalli': ['Hawalli', 'Salmiya', 'Rumaithiya', 'Bayan', 'Mishref', 'Jabriya', 'Salwa', 'Siddiq', 'Bidaa', 'Maidan Hawalli', 'Shaab', 'Hittin', 'Rawda', 'Zahra'],
  'Farwaniya': ['Farwaniya', 'Khaitan', 'Ardiya', 'Rabiyah', 'Abdullah Mubarak', 'Jleeb Al-Shuyoukh', 'Reggae', 'Omariya', 'Andalus', 'Ishbiliya', 'Abraq Khitan', 'Rihab', 'Sabah Al-Nasser'],
  'Mubarak Al-Kabeer': ['Mangaf', 'Fnaitees', 'Abu Halifa', 'Mahboula', 'Messilah', 'Sabahiya', 'Qurain', 'Qusour', 'Mubarak Al-Kabeer'],
  'Ahmadi': ['Ahmadi', 'Fahaheel', 'Riqqa', 'Shuaiba', 'Fintas', 'Rumaila', 'Ali Sabah Al-Salem', 'Sabah Al-Ahmad', 'Hadiya', 'Wafra', 'Abu Ftaira', 'Eqaila', 'Mangaf', 'Zour'],
  'Jahra': ['Jahra', 'Qairawan', 'Naeem', 'Sulaibiya', 'Amghara', 'Tayma', 'Qasr', 'Oyoun', 'Jahra Industrial', 'Waha'],
}

const ALL_AREAS = [...new Set(Object.values(AREAS_BY_GOV).flat())].sort()
const BLOCKS = Array.from({ length: 15 }, (_, i) => `Block ${i + 1}`)
const STREETS = Array.from({ length: 25 }, (_, i) => `Street ${i + 1}`)
const AVENUES = Array.from({ length: 10 }, (_, i) => `Avenue ${i + 1}`)

/* ── Combobox: filterable dropdown that also accepts free text ── */
function Combobox({ value, onChange, options, placeholder, hasError, icon: Icon }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    const handler = e => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = useCallback((option) => {
    onChange(option)
    setQuery(option)
    setOpen(false)
    setHighlighted(-1)
  }, [onChange])

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      setHighlighted(0)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => {
        const next = Math.min(h + 1, filtered.length - 1)
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => {
        const prev = Math.max(h - 1, 0)
        listRef.current?.children[prev]?.scrollIntoView({ block: 'nearest' })
        return prev
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted >= 0 && filtered[highlighted]) {
        select(filtered[highlighted])
      } else if (query.trim()) {
        onChange(query.trim())
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const borderClass = hasError
    ? 'border-red-300 bg-red-50/50 ring-1 ring-red-200'
    : value
      ? 'border-gray-200 bg-white hover:border-gray-300 focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/20'
      : 'border-gray-200 bg-white hover:border-gray-300 focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/20'

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center rounded-xl border transition-all duration-200 ${borderClass}`}>
        {Icon && (
          <span className="pl-3.5 flex-shrink-0">
            <Icon className={`w-4 h-4 ${hasError ? 'text-red-400' : 'text-gray-400'}`} />
          </span>
        )}
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={e => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
            setHighlighted(-1)
          }}
          onFocus={() => { setOpen(true); setHighlighted(-1) }}
          onKeyDown={handleKeyDown}
          className={`w-full ${Icon ? 'pl-2.5' : 'pl-4'} pr-10 py-3 text-sm bg-transparent focus:outline-none ${
            hasError ? 'text-red-900 placeholder-red-300' : value ? 'text-gray-900' : 'text-gray-400 placeholder-gray-400'
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={e => { e.preventDefault(); setOpen(o => !o) }}
          className="pr-3.5 flex-shrink-0"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${hasError ? 'text-red-400' : 'text-gray-400'}`} />
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl shadow-gray-200/60 overflow-hidden max-h-52 overflow-y-auto"
        >
          {filtered.length > 0 ? (
            filtered.map((option, i) => (
              <li
                key={option}
                onMouseDown={e => { e.preventDefault(); select(option) }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  i === highlighted
                    ? 'bg-gray-900 text-white'
                    : option === value
                      ? 'bg-gray-50 font-semibold text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-gray-400 italic">
              Press Enter to use "{query}"
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  const { items, totalPrice, dispatch } = useCart()
  const addToast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    governorate: '', area: '', block: '', street: '', avenue: '',
    house: '', apartment: '', notes: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const summaryRef = useRef(null)

  const totalQty = items.reduce((s, i) => s + i.quantity, 0)
  const shipping = calcShipping(totalPrice)
  const grandTotal = totalPrice + shipping

  /* Clear area when governorate changes and area is no longer valid */
  useEffect(() => {
    if (form.governorate && form.area) {
      const validAreas = AREAS_BY_GOV[form.governorate] || []
      if (!validAreas.includes(form.area)) {
        setForm(f => ({ ...f, area: '' }))
      }
    }
  }, [form.governorate])

  const setField = (name, value) => {
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  /* ── Empty cart state ── */
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
    if (!form.customer_name.trim()) errs.customer_name = 'Full name is required'
    if (!form.customer_email.trim() || !/\S+@\S+\.\S+/.test(form.customer_email)) errs.customer_email = 'Valid email is required'
    if (!form.customer_phone.trim()) errs.customer_phone = 'Phone number is required'
    if (!form.governorate) errs.governorate = 'Governorate is required'
    if (!form.area) errs.area = 'Area is required'
    if (!form.block) errs.block = 'Block is required'
    if (!form.street) errs.street = 'Street is required'
    if (!form.house) errs.house = 'House / building number is required'
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
      const addressParts = [
        form.block,
        form.street,
        form.avenue && `Avenue ${form.avenue.replace(/^avenue\s*/i, '')}`,
        form.house,
        form.apartment && `Apt ${form.apartment}`,
      ].filter(Boolean)
      const address = addressParts.join(', ')

      const order = await createOrder({
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        city: form.governorate,
        address: `${form.area}, ${address}`,
        notes: form.notes,
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

  const areaOptions = form.governorate
    ? (AREAS_BY_GOV[form.governorate] || ALL_AREAS)
    : ALL_AREAS

  return (
    <div className="min-h-screen bg-gray-50/50 pb-6">
      <SEO title="Checkout" noIndex={true} />

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

              {/* ── Contact Information ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Contact Information</p>
                    <p className="text-[11px] text-gray-400">How can we reach you about your order?</p>
                  </div>
                </div>
                <div className="px-5 sm:px-6 py-5 sm:py-6 grid sm:grid-cols-2 gap-x-4 gap-y-5">

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.customer_name ? 'text-red-400' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={form.customer_name}
                        onChange={e => setField('customer_name', e.target.value)}
                        className={`${inputBase} ${errors.customer_name ? inputErr : inputOk}`}
                      />
                    </div>
                    {errors.customer_name && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" />{errors.customer_name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.customer_phone ? 'text-red-400' : 'text-gray-400'}`} />
                      <input
                        type="tel"
                        placeholder="+965 XXXX XXXX"
                        value={form.customer_phone}
                        onChange={e => setField('customer_phone', e.target.value)}
                        className={`${inputBase} ${errors.customer_phone ? inputErr : inputOk}`}
                      />
                    </div>
                    {errors.customer_phone && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" />{errors.customer_phone}</p>}
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.customer_email ? 'text-red-400' : 'text-gray-400'}`} />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={form.customer_email}
                        onChange={e => setField('customer_email', e.target.value)}
                        className={`${inputBase} ${errors.customer_email ? inputErr : inputOk}`}
                      />
                    </div>
                    {errors.customer_email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" />{errors.customer_email}</p>}
                  </div>

                </div>
              </div>

              {/* ── Delivery Address ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Delivery Address</p>
                    <p className="text-[11px] text-gray-400">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-4">

                  {/* Row 1: Governorate + Area */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        Governorate <span className="text-red-400">*</span>
                      </label>
                      <Combobox
                        value={form.governorate}
                        onChange={v => setField('governorate', v)}
                        options={GOVERNORATES}
                        placeholder="Select or type governorate"
                        hasError={!!errors.governorate}
                        icon={MapPin}
                      />
                      {errors.governorate && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" />{errors.governorate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        Area / City <span className="text-red-400">*</span>
                      </label>
                      <Combobox
                        value={form.area}
                        onChange={v => setField('area', v)}
                        options={areaOptions}
                        placeholder="Select or type area"
                        hasError={!!errors.area}
                        icon={MapPin}
                      />
                      {errors.area && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" />{errors.area}</p>}
                    </div>
                  </div>

                  {/* Row 2: Block + Street + Avenue */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        Block <span className="text-red-400">*</span>
                      </label>
                      <Combobox
                        value={form.block}
                        onChange={v => setField('block', v)}
                        options={BLOCKS}
                        placeholder="e.g. Block 5"
                        hasError={!!errors.block}
                        icon={Hash}
                      />
                      {errors.block && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" />{errors.block}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        Street <span className="text-red-400">*</span>
                      </label>
                      <Combobox
                        value={form.street}
                        onChange={v => setField('street', v)}
                        options={STREETS}
                        placeholder="e.g. Street 12"
                        hasError={!!errors.street}
                        icon={Hash}
                      />
                      {errors.street && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" />{errors.street}</p>}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        Avenue <span className="text-gray-400 font-normal normal-case">(optional)</span>
                      </label>
                      <Combobox
                        value={form.avenue}
                        onChange={v => setField('avenue', v)}
                        options={AVENUES}
                        placeholder="e.g. Avenue 3"
                        hasError={false}
                        icon={Hash}
                      />
                    </div>
                  </div>

                  {/* Row 3: House/Building + Floor/Apt */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        House / Building No. <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.house ? 'text-red-400' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          placeholder="e.g. 42 or Villa 7"
                          value={form.house}
                          onChange={e => setField('house', e.target.value)}
                          className={`${inputBase} ${errors.house ? inputErr : inputOk}`}
                        />
                      </div>
                      {errors.house && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" />{errors.house}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        Floor / Apt No. <span className="text-gray-400 font-normal normal-case">(optional)</span>
                      </label>
                      <div className="relative">
                        <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="e.g. Floor 3, Apt 12"
                          value={form.apartment}
                          onChange={e => setField('apartment', e.target.value)}
                          className={`${inputBase} ${inputOk}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Order Notes <span className="text-gray-400 font-normal normal-case">(optional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <textarea
                        rows={3}
                        placeholder="Any special delivery instructions or requests..."
                        value={form.notes}
                        onChange={e => setField('notes', e.target.value)}
                        className={`${inputBase} resize-none ${inputOk}`}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Payment Method ── */}
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
                      <p className="text-xs text-gray-500 mt-0.5">Pay cash when your order arrives at your door</p>
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
                      <div key={item.id} className="flex gap-3">
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
                      {shipping === 0
                        ? <span className="font-semibold text-emerald-600">FREE</span>
                        : <span className="font-semibold text-gray-900 tabular-nums">{formatPrice(SHIPPING_FEE)}</span>
                      }
                    </div>
                    {shipping > 0 && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
                        Add {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} more for free shipping
                      </p>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment</span>
                      <span className="font-medium text-gray-700">Cash on Delivery</span>
                    </div>
                    <div className="h-px bg-gray-200 my-1" />
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-gray-900 tabular-nums">{formatPrice(grandTotal)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Inclusive of all taxes</p>
                  </div>

                  {/* Place Order */}
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
                          <Lock className="w-4 h-4" /> Place Order — {formatPrice(grandTotal)}
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-gray-400 mt-3">
                      <Shield className="w-3.5 h-3.5" />
                      <p className="text-[10px] sm:text-xs">Secure checkout · Same-day delivery · Cash on delivery</p>
                    </div>
                  </div>
                </div>

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
