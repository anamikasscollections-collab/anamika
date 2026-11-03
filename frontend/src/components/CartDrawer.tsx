import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotalPaise,
    shippingPaise,
    discountPaise,
    totalPaise,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    const res = await applyCoupon(couponInput.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-luxury-cream shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-luxury-gold/20 flex items-center justify-between bg-luxury-ivory">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-luxury-wine" />
              <h2 className="font-serif font-bold text-lg text-luxury-espresso">
                Royal Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-full text-luxury-espresso/70 hover:text-luxury-wine hover:bg-luxury-gold/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold-dark mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-luxury-espresso">
                  Your Shopping Bag is Empty
                </h3>
                <p className="text-xs text-luxury-espresso/60 mt-1 max-w-xs">
                  Discover our pure heirloom sarees and handcrafted festive kurtis to adorn your wardrobe.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/category/sarees');
                  }}
                  className="mt-6 px-6 py-2.5 bg-luxury-wine text-luxury-ivory text-xs uppercase tracking-widest font-semibold rounded hover:bg-luxury-wine-light transition-colors"
                >
                  Explore Sarees
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex space-x-4 p-3 bg-white rounded-lg border border-luxury-beige/40 shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded bg-luxury-warmWhite flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-luxury-espresso line-clamp-1">
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] text-luxury-espresso/70 mt-0.5">
                        <span>Size: <strong>{item.size}</strong></span>
                        <span>•</span>
                        <span>Shade: <strong>{item.color}</strong></span>
                      </div>
                      <div className="mt-1 font-serif font-bold text-sm text-luxury-wine">
                        ₹{(item.unitPricePaise / 100).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-luxury-beige/20">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 border border-luxury-beige/60 rounded px-2 py-0.5 bg-luxury-warmWhite">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="text-luxury-espresso/70 hover:text-luxury-wine"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-luxury-espresso min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stockAvailable}
                          className="text-luxury-espresso/70 hover:text-luxury-wine disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-rose-700 hover:text-rose-900 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-luxury-gold/20 bg-luxury-ivory space-y-4">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-2.5 rounded flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> Applied (-₹{appliedCoupon.discountRupees})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-700 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Have a coupon? E.g. ELEGANCE10"
                    className="flex-1 bg-white border border-luxury-gold/30 rounded px-3 py-1.5 text-xs text-luxury-espresso uppercase placeholder:normal-case focus:outline-none focus:border-luxury-gold"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-luxury-espresso hover:bg-luxury-espresso-light text-luxury-ivory text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-700">{couponError}</p>}

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-luxury-espresso/80 pt-2 border-t border-luxury-beige/30">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(subtotalPaise / 100).toLocaleString('en-IN')}</span>
                </div>
                {discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Savings</span>
                    <span>-₹{(discountPaise / 100).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span>
                    {shippingPaise > 0
                      ? `₹${(shippingPaise / 100).toLocaleString('en-IN')}`
                      : 'Calculated at Checkout (Shiprocket)'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-luxury-wine pt-2 border-t border-luxury-beige/40">
                  <span>Total Amount</span>
                  <span>₹{(totalPaise / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Strict No Returns Notice */}
              <div className="flex items-start space-x-2 bg-amber-50/80 border border-amber-200/80 p-2.5 rounded text-[11px] text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>No Returns or Exchanges:</strong> In keeping with luxury hygiene and handloom authenticity, all sales are final. Defective pieces are covered with unboxing video proof.
                </p>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory font-serif font-semibold py-3 px-4 rounded shadow-md hover:shadow-luxury transition-all flex items-center justify-center space-x-2"
              >
                <span>Proceed to UPI Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

