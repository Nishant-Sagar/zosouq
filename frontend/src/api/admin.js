import axios from 'axios'

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
})

adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers['x-admin-token'] = token
  return config
})

adminApi.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_username')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export const adminLogin = (username, password) =>
  adminApi.post('/admin/login', { username, password }).then(r => r.data)

export const adminGetStats = () =>
  adminApi.get('/admin/stats').then(r => r.data)

export const adminGetOrders = (params = {}) =>
  adminApi.get('/admin/orders', { params }).then(r => r.data)

export const adminUpdateOrderStatus = (orderId, status) =>
  adminApi.put(`/admin/orders/${orderId}/status`, { status }).then(r => r.data)

export const adminGetMe = () =>
  adminApi.get('/admin/me').then(r => r.data)

export const adminGetProducts = (params = {}) =>
  adminApi.get('/admin/products', { params }).then(r => r.data)

export const adminCreateProduct = (formData) =>
  adminApi.post('/admin/products', formData, { timeout: 60000 }).then(r => r.data)

export const adminUpdateProduct = (id, formData) =>
  adminApi.put(`/admin/products/${id}`, formData, { timeout: 60000 }).then(r => r.data)

export const adminDeleteProduct = (id) =>
  adminApi.delete(`/admin/products/${id}`).then(r => r.data)

export const adminPublishProduct = (id) =>
  adminApi.put(`/admin/products/${id}/publish`).then(r => r.data)

export const adminStageProduct = (id) =>
  adminApi.put(`/admin/products/${id}/stage`).then(r => r.data)

export const adminExportProducts = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) qs.set(k, v) })
  return adminApi.get(`/admin/products/export?${qs}`, { responseType: 'blob' }).then(r => r.data)
}

export const adminGetBanners = () =>
  adminApi.get('/admin/banners').then(r => r.data)

export const adminUpdateBanner = (location, data) =>
  adminApi.put(`/admin/banners/${location}`, data).then(r => r.data)

export const adminUploadBannerImage = (location, file) => {
  const form = new FormData()
  form.append('image', file)
  return adminApi.post(`/admin/banners/${location}/upload-image`, form).then(r => r.data)
}

export default adminApi
