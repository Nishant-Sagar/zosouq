import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { getCategory, getProducts } from '../api'
import ProductCard from '../components/ProductCard'

function ProductSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="bg-slate-200 aspect-square" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-4/5" />
        <div className="h-5 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  )
}

const SORT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
]

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getCategory(slug), getProducts({ category_slug: slug })]).then(([cat, prods]) => {
      setCategory(cat)
      setProducts(prods)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  const displayProducts = useCallback(() => {
    let result = [...products]
    if (maxPrice) result = result.filter(p => p.price <= parseFloat(maxPrice))
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating)
    return result
  }, [products, sort, maxPrice])

  const filtered = displayProducts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{category?.name || 'Category'}</span>
      </nav>

      {/* Category Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="relative">
          <span className="text-4xl mb-3 block">{category?.icon}</span>
          <h1 className="text-3xl font-bold mb-2">{category?.name}</h1>
          <p className="text-indigo-200">{category?.description}</p>
          <p className="mt-3 text-sm text-indigo-300">
            {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              filterOpen || maxPrice
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {maxPrice && (
              <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
                1
              </span>
            )}
          </button>

          {maxPrice && (
            <button
              onClick={() => setMaxPrice('')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors"
            >
              Max ${maxPrice} <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-primary-300 transition-colors"
          >
            Sort: {SORT_OPTIONS.find(o => o.value === sort)?.label || 'Default'}
            <ChevronDown className="w-4 h-4" />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1 w-48 z-10 animate-fade-in">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setSortOpen(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    sort === opt.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 animate-fade-in">
          <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">$</span>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="input-field w-32"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">😕</p>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
          <p className="text-slate-500 mb-6">Try adjusting your filters or browse another category.</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
