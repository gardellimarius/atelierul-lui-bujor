import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import WishlistPage from './pages/WishlistPage'
import LoginPage from './pages/admin/LoginPage'
import AdminPage from './pages/admin/AdminPage'
import AdminProductEditPage from './pages/admin/AdminProductEditPage'
import ProtectedRoute from './components/ProtectedRoute'
import { WishlistProvider } from './context/WishlistContext'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname, search])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <WishlistProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/products/new" element={
            <ProtectedRoute>
              <AdminProductEditPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/products/:id" element={
            <ProtectedRoute>
              <AdminProductEditPage />
            </ProtectedRoute>
          } />
        </Routes>
      </WishlistProvider>
    </BrowserRouter>
  )
}
