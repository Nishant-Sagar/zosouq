import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider, ToastProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'
import HomePage from './pages/HomePage'
import CategoriesPage from './pages/CategoriesPage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import SearchPage from './pages/SearchPage'
import WishlistPage from './pages/WishlistPage'
import MyOrdersPage from './pages/MyOrdersPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <MobileBottomNav />
            </div>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
