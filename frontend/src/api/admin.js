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

export default adminApi
