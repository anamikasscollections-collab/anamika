import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Truck, RefreshCcw, Heart, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-luxury-espresso text-luxury-ivory border-t-2 border-luxury-gold pt-16 pb-12 relative overflow-hidden">
      {/* Decorative Gold Accent Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-luxury-beige/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-luxury-wine/40 border border-luxury-gold/30 flex items-center justify-center flex-shrink-0 text-luxury-gold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-luxury-gold-light text-base">Pure Authentic Silk</h4>
              <p className="text-xs text-luxury-ivory/70 mt-1">Certified handloom Banarasi & Kanjivaram heirlooms</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-luxury-wine/40 border border-luxury-gold/30 flex items-center justify-center flex-shrink-0 text-luxury-gold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-luxury-gold-light text-base">Shiprocket Express Air</h4>
              <p className="text-xs text-luxury-ivory/70 mt-1">Insured tracked courier across all Indian PIN codes</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-luxury-wine/40 border border-luxury-gold/30 flex items-center justify-center flex-shrink-0 text-luxury-gold">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-luxury-gold-light text-base">Strict Purity Standards</h4>
              <p className="text-xs text-luxury-ivory/70 mt-1">No returns or exchanges on heirloom couture</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-luxury-wine/40 border border-luxury-gold/30 flex items-center justify-center flex-shrink-0 text-luxury-gold">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-luxury-gold-light text-base">Artisanal Dedication</h4>
              <p className="text-xs text-luxury-ivory/70 mt-1">Every thread woven by generational master weavers</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-brand text-2xl font-bold tracking-[0.2em] text-luxury-gold">
                ANAMIKA
              </span>
              <span className="block text-[10px] tracking-[0.35em] text-luxury-ivory/80 uppercase font-medium">
                COLLECTIONS
              </span>
            </Link>
            <p className="text-sm text-luxury-ivory/80 leading-relaxed font-light max-w-sm">
              "Elegance in Every Thread." Curating the finest handwoven silks, pure Banarasis, gossamer organzas, and handcrafted designer kurtis tailored for young women who cherish timeless heritage.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919876543210?text=Namaste%20ANAMIKA%20COLLECTIONS%2C%20I%20would%20like%20to%20inquire%20about%20a%20product."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-full border border-emerald-500/30 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Concierge (+91 98765 43210)</span>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-serif text-sm font-semibold tracking-widest text-luxury-gold uppercase mb-4">
              Collections
            </h3>
            <ul className="space-y-2 text-sm text-luxury-ivory/70 font-light">
              <li>
                <Link to="/category/sarees" className="hover:text-luxury-gold transition-colors">
                  Heritage Sarees
                </Link>
              </li>
              <li>
                <Link to="/category/kurtis" className="hover:text-luxury-gold transition-colors">
                  Artisanal Kurtis
                </Link>
              </li>
              <li>
                <Link to="/category/new-arrivals" className="hover:text-luxury-gold transition-colors">
                  New Festive Arrivals
                </Link>
              </li>
              <li>
                <Link to="/category/bestsellers" className="hover:text-luxury-gold transition-colors">
                  Bestselling Drapes
                </Link>
              </li>
              <li>
                <Link to="/category/offers" className="hover:text-luxury-gold transition-colors">
                  Seasonal Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h3 className="font-serif text-sm font-semibold tracking-widest text-luxury-gold uppercase mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2 text-sm text-luxury-ivory/70 font-light">
              <li>
                <Link to="/track-order" className="hover:text-luxury-gold transition-colors">
                  Track Your Shipment
                </Link>
              </li>
              <li>
                <Link to="/policies/returns-and-exchanges" className="text-luxury-gold hover:underline font-normal">
                  Return & Exchange Policy
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-luxury-gold transition-colors">
                  Defective / Damaged Claim
                </Link>
              </li>
              <li>
                <Link to="/policies/shipping" className="hover:text-luxury-gold transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-luxury-gold transition-colors">
                  Privacy Policy & Terms
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-luxury-ivory/30 hover:text-luxury-gold text-xs">
                  Store Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="font-serif text-sm font-semibold tracking-widest text-luxury-gold uppercase mb-4">
              Royal Newsletter
            </h3>
            <p className="text-xs text-luxury-ivory/70 leading-relaxed mb-4">
              Be the first to preview limited festive weavers' drops and private seasonal previews.
            </p>
            {subscribed ? (
              <div className="bg-luxury-wine/50 border border-luxury-gold/40 text-luxury-gold-light text-xs p-3 rounded">
                ✓ Thank you. You have been added to our royal guest list.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-luxury-espresso-light/80 border border-luxury-gold/30 rounded px-3 py-2 text-xs text-luxury-ivory placeholder-luxury-ivory/40 focus:outline-none focus:border-luxury-gold"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory rounded text-xs transition-colors"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Legal Disclaimer Box for Return & Exchange Policy */}
        <div className="bg-luxury-espresso-dark/90 border border-luxury-gold/20 p-4 rounded-lg my-6 text-xs text-luxury-ivory/70">
          <strong className="text-luxury-gold-light block mb-1">
            Official Store Notice – No Returns or Exchanges:
          </strong>
          ANAMIKA COLLECTIONS specializes in fragile, handcrafted silk sarees and couture kurtis. To preserve fabric authenticity and pristine purity, all items are non-returnable and non-exchangeable once dispatched. If you receive an item with a verifiable manufacturing defect, transit damage, or incorrect dispatch, please submit an unboxing video claim via our <Link to="/support" className="text-luxury-gold underline">Defective / Damaged Remedy Process</Link> within 48 hours of delivery.
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-luxury-beige/10 flex flex-col md:flex-row items-center justify-between text-xs text-luxury-ivory/50">
          <p>© {new Date().getFullYear()} ANAMIKA COLLECTIONS. All Rights Reserved. Elegance in Every Thread.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <span>Verified Razorpay UPI</span>
            <span>•</span>
            <span>Official Shiprocket Logistics</span>
            <span>•</span>
            <span>100% Authentic Handlooms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

