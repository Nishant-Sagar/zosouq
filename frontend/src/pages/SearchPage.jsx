import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Tag } from 'lucide-react'
import { getProducts, getProductCount } from '../api'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import SEO from '../components/SEO'

const PER_PAGE = 40

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
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const isPriceFilter = !!(maxPrice || minPrice)
  const hasQuery = !!(query || isPriceFilter)

  useEffect(() => {
    setPage(1)
  }, [query, maxPrice, minPrice])

  useEffect(() => {
    if (!hasQuery) return
    setLoading(true)
    const params = { limit: PER_PAGE, skip: (page - 1) * PER_PAGE }
    const countParams = {}
    if (query) { params.search = query; countParams.search = query }
    if (maxPrice) { params.max_price = parseFloat(maxPrice); countParams.max_price = parseFloat(maxPrice) }
    if (minPrice) { params.min_price = parseFloat(minPrice); countParams.min_price = parseFloat(minPrice) }
    Promise.all([getProducts(params), getProductCount(countParams)])
      .then(([prods, count]) => { setProducts(prods); setTotal(count) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [query, maxPrice, minPrice, page])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(total / PER_PAGE)
  const pageTitle = isPriceFilter
    ? `Products Under ${maxPrice} KWD`
    : query ? `Results for "${query}"` : 'Search Products'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={query ? `Results for "${query}"` : 'Search Products'}
        description={query ? `Search results for "${query}" on Zosouq. Find authentic beauty products in Kuwait with same-day delivery.` : 'Search thousands of authentic beauty, perfume & skincare products on Zosouq Kuwait.'}
        path={`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`}
        noIndex={!query}
      />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {isPriceFilter ? <Tag className="w-6 h-6 text-amber-500" /> : <Search className="w-6 h-6 text-slate-400" />}
          <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
        </div>
        {!loading && hasQuery && (
          <p className="text-slate-500 text-sm ml-9">
            {total} product{total !== 1 ? 's' : ''} found
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
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          {totalPages > 1 && (
            <p className="text-center text-xs text-gray-400 mt-3">
              Page {page} of {totalPages} · {total} products
            </p>
          )}
        </>
      )}
    </div>
  )
}
