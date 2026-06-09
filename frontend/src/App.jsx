import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CartProvider, ToastProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Store pages
const HomePage             = lazy(() => import('./pages/HomePage'))
const CategoriesPage       = lazy(() => import('./pages/CategoriesPage'))
const CategoryPage         = lazy(() => import('./pages/CategoryPage'))
const ProductPage          = lazy(() => import('./pages/ProductPage'))
const CartPage             = lazy(() => import('./pages/CartPage'))
const CheckoutPage         = lazy(() => import('./pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'))
const SearchPage           = lazy(() => import('./pages/SearchPage'))
const WishlistPage         = lazy(() => import('./pages/WishlistPage'))
const MyOrdersPage         = lazy(() => import('./pages/MyOrdersPage'))
const SalePage             = lazy(() => import('./pages/SalePage'))
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage'))

// Admin pages (separate bundle — no store context needed)
const AdminLoginPage     = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage  = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminBannersPage   = lazy(() => import('./pages/admin/AdminBannersPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
    </div>
  )
}

function AdminLoader() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-800 border-t-gray-400 rounded-full animate-spin" />
    </div>
  )
}

// Synchronous guard — redirects before any content renders
function RequireAuth({ children }) {
  if (!localStorage.getItem('admin_token')) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                              element={<HomePage />} />
            <Route path="/categories"                   element={<CategoriesPage />} />
            <Route path="/category/:slug"               element={<CategoryPage />} />
            <Route path="/product/:slug"                element={<ProductPage />} />
            <Route path="/cart"                         element={<CartPage />} />
            <Route path="/checkout"                     element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
            <Route path="/search"                       element={<SearchPage />} />
            <Route path="/wishlist"                     element={<WishlistPage />} />
            <Route path="/my-orders"                    element={<MyOrdersPage />} />
            <Route path="/sale/:slug"                  element={<SalePage />} />
            <Route path="*"                             element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LanguageProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Admin routes — no store nav/footer */}
              <Route path="/admin/login" element={
                <Suspense fallback={<AdminLoader />}>
                  <AdminLoginPage />
                </Suspense>
              } />
              <Route path="/admin/dashboard" element={
                <RequireAuth>
                  <Suspense fallback={<AdminLoader />}>
                    <AdminDashboardPage />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/admin/products" element={
                <RequireAuth>
                  <Suspense fallback={<AdminLoader />}>
                    <AdminProductsPage />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/admin/banners" element={
                <RequireAuth>
                  <Suspense fallback={<AdminLoader />}>
                    <AdminBannersPage />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

              {/* Store routes */}
              <Route path="/*" element={<StoreLayout />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
