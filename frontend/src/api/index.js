import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
})

// ── In-memory cache (persists across SPA navigations) ──────────────────────
const _cache = new Map()

const TTL = {
  categories: 10 * 60 * 1000,  // 10 min
  products:    5 * 60 * 1000,  //  5 min
  banner:     60 * 60 * 1000,  //  1 hour
  product:     5 * 60 * 1000,  //  5 min
}

// Stale-while-revalidate: return cached data instantly, refresh in background if stale
function swr(key, ttl, fetcher) {
  const hit = _cache.get(key)
  const now = Date.now()

  if (hit) {
    if (now - hit.ts < ttl) {
      // Fresh — return immediately
      return Promise.resolve(hit.data)
    }
    // Stale — return old data instantly, refresh in background
    fetcher().then(data => _cache.set(key, { data, ts: Date.now() })).catch(() => {})
    return Promise.resolve(hit.data)
  }

  // Nothing cached — fetch, store, return
  return fetcher().then(data => {
    _cache.set(key, { data, ts: Date.now() })
    return data
  })
}

// Call this on hover over a link to warm the cache before the user clicks
export function prefetch(fn) {
  try { fn() } catch {}
}

// ── Categories ──────────────────────────────────────────────────────────────
export const getCategories = () =>
  swr('categories', TTL.categories, () => api.get('/categories/').then(r => r.data))

export const getCategory = (slug) =>
  swr(`category:${slug}`, TTL.categories, () => api.get(`/categories/${slug}`).then(r => r.data))

// ── Products ────────────────────────────────────────────────────────────────
export const getProducts = (params = {}) => {
  const key = `products:${JSON.stringify(params)}`
  return swr(key, TTL.products, () => api.get('/products/', { params }).then(r => r.data))
}

export const getProductCount = (params = {}) => {
  const key = `product-count:${JSON.stringify(params)}`
  return swr(key, TTL.products, () => api.get('/products/count', { params }).then(r => r.data.count))
}

export const getProduct = (slug) =>
  swr(`product:${slug}`, TTL.product, () => api.get(`/products/${slug}`).then(r => r.data))

// ── Orders ──────────────────────────────────────────────────────────────────
export const createOrder = (orderData) => api.post('/orders/', orderData).then(r => r.data)
export const getOrder = (orderNumber) => api.get(`/orders/${orderNumber}`).then(r => r.data)
export const searchOrders = (params) => api.get('/orders/', { params }).then(r => r.data)

// ── Banners ─────────────────────────────────────────────────────────────────
export const getBanner = (location) =>
  swr(`banner:${location}`, TTL.banner, () =>
    api.get(`/banners/${location}`).then(r => r.data?.data ?? null).catch(() => null)
  )

// ── Reviews ─────────────────────────────────────────────────────────────────
export const getReviews = (slug) => api.get(`/reviews/${slug}`).then(r => r.data)
export const submitReview = (slug, data) => api.post(`/reviews/${slug}`, data).then(r => r.data)

export default api
