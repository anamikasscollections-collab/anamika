import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenSearch }) => {
  const navigate = useNavigate();
  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Sarees', path: '/category/sarees' },
    { name: 'Kurtis', path: '/category/kurtis' },
    { name: 'New Arrivals', path: '/category/new-arrivals' },
    { name: 'Bestsellers', path: '/category/bestsellers' },
    { name: 'Offers', path: '/category/offers' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-luxury-cream/95 backdrop-blur-md border-b border-luxury-gold/20 shadow-sm transition-all duration-300">
      {/* Promotional Top Announcement Bar */}
      <div className="bg-luxury-wine text-luxury-ivory text-xs py-2 px-4 text-center tracking-wider font-medium flex items-center justify-center space-x-2">
        <span className="text-luxury-gold">✨</span>
        <span>Elegance in Every Thread | Insured Express Delivery Across India | Razorpay Verified UPI Payments</span>
        <span className="text-luxury-gold">✨</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-luxury-espresso hover:text-luxury-wine transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 md:flex-initial flex justify-center md:justify-start">
            <Link to="/" className="text-center md:text-left group">
              <span className="block font-brand text-2xl sm:text-3xl font-bold tracking-[0.2em] text-luxury-wine group-hover:text-luxury-wine-light transition-colors">
                ANAMIKA
              </span>
              <span className="block text-[9px] tracking-[0.35em] text-luxury-gold-antique uppercase font-medium -mt-1">
                COLLECTIONS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm tracking-widest uppercase font-medium text-luxury-espresso hover:text-luxury-wine transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-luxury-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-luxury-espresso hover:text-luxury-wine hover:scale-110 transition-transform"
              title="Search Sarees & Kurtis"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-luxury-espresso hover:text-luxury-wine hover:scale-110 transition-transform relative"
              title="Saved Items"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-luxury-wine text-luxury-ivory text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag / Cart */}
            <button
              onClick={openCart}
              className="p-2 text-luxury-espresso hover:text-luxury-wine hover:scale-110 transition-transform relative"
              title="View Cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-luxury-gold-dark text-luxury-ivory text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account */}
            <button
              onClick={() => {
                if (user) {
                  navigate('/account');
                } else {
                  onOpenAuth();
                }
              }}
              className="p-2 text-luxury-espresso hover:text-luxury-wine hover:scale-110 transition-transform flex items-center space-x-1"
              title={user ? `Signed in as ${user.fullName}` : 'Sign In'}
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              {user && (
                <span className="hidden lg:inline text-xs font-medium text-luxury-wine truncate max-w-[80px]">
                  {user.fullName.split(' ')[0]}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-luxury-cream border-t border-luxury-gold/20 px-6 py-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base uppercase tracking-wider font-medium text-luxury-espresso hover:text-luxury-wine py-2 border-b border-luxury-gold/10"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base uppercase tracking-wider font-medium text-luxury-wine py-2"
            >
              {user ? 'My Royal Account' : 'Sign In / Register'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

