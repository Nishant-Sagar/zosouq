import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Tag } from 'lucide-react'
import { getProducts } from '../api'
import ProductCard from '../components/ProductCard'

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-slate-200 aspect-square" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-4/5" />
        <div className="h-5 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const minPrice = searchParams.get('min_price') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const isPriceFilter = !!(maxPrice || minPrice)
  const hasQuery = !!(query || isPriceFilter)

  useEffect(() => {
    if (!hasQuery) return
    setLoading(true)
    const params = {}
    if (query) params.search = query
    if (maxPrice) params.max_price = parseFloat(maxPrice)
    if (minPrice) params.min_price = parseFloat(minPrice)
    getProducts(params).then(setProducts).catch(() => {}).finally(() => setLoading(false))
  }, [query, maxPrice, minPrice])

  const pageTitle = isPriceFilter
    ? `Products Under ${maxPrice} KWD`
    : query ? `Results for "${query}"` : 'Search Products'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {isPriceFilter ? <Tag className="w-6 h-6 text-amber-500" /> : <Search className="w-6 h-6 text-slate-400" />}
          <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
        </div>
        {!loading && hasQuery && (
          <p className="text-slate-500 text-sm ml-9">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {!hasQuery && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Use the search bar above to find products.</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {!loading && hasQuery && products.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
          <p className="text-slate-500 mb-6">
            {isPriceFilter ? `No products found under ${maxPrice} KWD.` : `We couldn't find anything for "${query}". Try different keywords.`}
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95">Browse All Products</Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
