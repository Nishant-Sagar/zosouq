import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
})

export const getCategories = () => api.get('/categories/').then(r => r.data)
export const getCategory = (slug) => api.get(`/categories/${slug}`).then(r => r.data)

export const getProducts = (params = {}) => api.get('/products/', { params }).then(r => r.data)
export const getProduct = (slug) => api.get(`/products/${slug}`).then(r => r.data)

export const createOrder = (orderData) => api.post('/orders/', orderData).then(r => r.data)
export const getOrder = (orderNumber) => api.get(`/orders/${orderNumber}`).then(r => r.data)
export const searchOrders = (params) => api.get('/orders/', { params }).then(r => r.data)

export default api
