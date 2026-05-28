import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

// Lazy load pages for code splitting & faster initial load
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

import './styles/theme.css';

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            
            {/* Global Container with dark background */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              
              {/* Common Header Navbar */}
              <Navbar onOpenAuth={() => setAuthOpen(true)} />
              
              {/* Main Content Area with Suspense for lazy loading */}
              <main style={{ flex: 1 }}>
                <Suspense fallback={
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <div className="loader"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart onOpenAuth={() => setAuthOpen(true)} />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Routes>
                </Suspense>
              </main>

              {/* Common Footer */}
              <Footer />
            </div>

            {/* Global floating Auth Modal */}
            <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
