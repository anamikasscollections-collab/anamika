import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';

import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { ReturnExchangePolicyPage, ShippingPolicyPage } from './pages/PolicyPages';
import { SupportPage } from './pages/SupportPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export const App: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen bg-luxury-ivory text-luxury-espresso selection:bg-luxury-gold/30 selection:text-luxury-wine-dark">
              {/* Customer Navigation Bar */}
              <Navbar
                onOpenAuth={() => setAuthModalOpen(true)}
                onOpenSearch={() => setSearchModalOpen(true)}
              />

              {/* Main App Content Viewport */}
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order/:id" element={<OrderSuccessPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/policies/returns-and-exchanges" element={<ReturnExchangePolicyPage />} />
                  <Route path="/policies/shipping" element={<ShippingPolicyPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/track-order" element={<SupportPage />} />

                  {/* Separate Secure Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin" element={<AdminLogin />} />
                </Routes>
              </div>

              {/* Customer Footer */}
              <Footer />

              {/* Slide-over & Pop-up Modals */}
              <CartDrawer />
              <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
              />
              <SearchModal
                isOpen={searchModalOpen}
                onClose={() => setSearchModalOpen(false)}
              />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
