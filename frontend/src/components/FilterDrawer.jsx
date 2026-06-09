import { useState, useEffect, useRef } from 'react'
import { X, SlidersHorizontal, Search } from 'lucide-react'

const SORT_OPTIONS = [
  { label: 'Default',             value: '' },
  { label: 'Price: Low to High',  value: 'price_asc' },
  { label: 'Price: High to Low',  value: 'price_desc' },
  { label: 'Top Rated',           value: 'rating' },
  { label: 'Highest Discount',    value: 'discount' },
]

const DISCOUNT_OPTIONS = [
  { label: 'Any Discount', min: 1 },
  { label: '20% or more',  min: 20 },
  { label: '30% or more',  min: 30 },
  { label: '40% or more',  min: 40 },
  { label: '50% or more',  min: 50 },
  { label: '55% or more',  min: 55 },
]

function Section({ title, children }) {
  return (
    <div className="border-b border-gray-100 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  )
}

export default function FilterDrawer({
  open,
  onClose,
  brands = [],
  accentColor = '#ec4899',
  // current applied values
  appliedBrands      = [],
  appliedMinPrice    = '',
  appliedMaxPrice    = '',
  appliedSort        = '',
  appliedMinDiscount = 1,
  onApply,
}) {
  const [selBrands,   setSelBrands]   = useState(appliedBrands)
  const [minPrice,    setMinPrice]    = useState(appliedMinPrice)
  const [maxPrice,    setMaxPrice]    = useState(appliedMaxPrice)
  const [sort,        setSort]        = useState(appliedSort)
  const [minDiscount, setMinDiscount] = useState(appliedMinDiscount)
  const [brandSearch, setBrandSearch] = useState('')
  const brandSearchRef = useRef(null)

  // Sync when drawer opens
  useEffect(() => {
    if (open) {
      setSelBrands(appliedBrands)
      setMinPrice(appliedMinPrice)
      setMaxPrice(appliedMaxPrice)
      setSort(appliedSort)
      setMinDiscount(appliedMinDiscount)
      setBrandSearch('')
    }
  }, [open]) // eslint-disable-line

  const visibleBrands = brandSearch.trim()
    ? brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
    : brands

  const toggleBrand = (brand) =>
    setSelBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])

  const hasFilters = selBrands.length > 0 || minPrice || maxPrice || sort || minDiscount > 1

  const handleApply = () => {
    onApply({ brands: selBrands, minPrice, maxPrice, sort, minDiscount })
    onClose()
  }

  const handleClear = () => {
    setSelBrands([]); setMinPrice(''); setMaxPrice('')
    setSort(''); setMinDiscount(1); setBrandSearch('')
    onApply({ brands: [], minPrice: '', maxPrice: '', sort: '', minDiscount: 1 })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer — slides from left */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-[88vw] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" style={{ color: accentColor }} />
            <h2 className="text-sm font-bold text-gray-900">Filters & Sort</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* ── Sort ── */}
          <Section title="Sort By">
            <div className="flex flex-col gap-1">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setSort(opt.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${sort === opt.value ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  style={sort === opt.value ? { backgroundColor: accentColor } : {}}>
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* ── Brand ── */}
          <Section title={`Brand${selBrands.length > 0 ? ` · ${selBrands.length} selected` : ''}`}>
            {/* Search within brands */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-3 focus-within:border-gray-400 transition-colors">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                ref={brandSearchRef}
                type="text"
                placeholder="Search brands…"
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
              />
              {brandSearch && (
                <button onClick={() => setBrandSearch('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Brand list — all shown, scrollable */}
            {brands.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 text-center">No brands available</p>
            ) : (
              <div className="max-h-56 overflow-y-auto -mx-1 px-1 space-y-0.5">
                {visibleBrands.map(brand => (
                  <button key={brand} onClick={() => toggleBrand(brand)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-all text-left group ${selBrands.includes(brand) ? 'bg-pink-50' : 'hover:bg-gray-50'}`}
                    style={selBrands.includes(brand) ? { backgroundColor: accentColor + '12' } : {}}>
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all`}
                      style={selBrands.includes(brand)
                        ? { borderColor: accentColor, backgroundColor: accentColor }
                        : { borderColor: '#d1d5db' }}>
                      {selBrands.includes(brand) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-xs truncate"
                      style={selBrands.includes(brand) ? { color: accentColor, fontWeight: 600 } : { color: '#374151' }}>
                      {brand}
                    </span>
                  </button>
                ))}
                {visibleBrands.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-3">No brands match "{brandSearch}"</p>
                )}
              </div>
            )}
            {selBrands.length > 0 && (
              <button onClick={() => setSelBrands([])}
                className="mt-2 text-xs font-medium hover:underline transition-colors"
                style={{ color: accentColor }}>
                Clear brand selection
              </button>
            )}
          </Section>

          {/* ── Price Range ── */}
          <Section title="Price Range (KD)">
            <div className="flex items-center gap-2">
              <input type="number" inputMode="decimal" placeholder="Min"
                value={minPrice} onChange={e => setMinPrice(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors" />
              <span className="text-gray-400 text-sm flex-shrink-0">–</span>
              <input type="number" inputMode="decimal" placeholder="Max"
                value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors" />
            </div>
          </Section>

          {/* ── Discount ── */}
          <Section title="Discount">
            <div className="flex flex-col gap-1">
              {DISCOUNT_OPTIONS.map(opt => (
                <button key={opt.min} onClick={() => setMinDiscount(opt.min)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${minDiscount === opt.min ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  style={minDiscount === opt.min ? { backgroundColor: accentColor } : {}}>
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer — pb-20 clears the mobile bottom nav bar */}
        <div className="px-5 pt-4 pb-20 sm:pb-4 border-t border-gray-100 flex-shrink-0 space-y-2">
          {hasFilters && (
            <button onClick={handleClear}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
              Clear All
            </button>
          )}
          <button onClick={handleApply}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: accentColor }}>
            Apply & Close
          </button>
        </div>
      </div>
    </>
  )
}
