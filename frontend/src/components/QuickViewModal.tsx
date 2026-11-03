import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Zap, Heart, Check, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface QuickViewModalProps {
  product: any | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.images[0]?.url || '');
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const unitPrice = (product.discountedPrice + (selectedVariant?.additionalPrice || 0)) / 100;
  const originalPrice = (product.originalPrice + (selectedVariant?.additionalPrice || 0)) / 100;
  const isOutOfStock = (selectedVariant?.stockQuantity || 0) <= 0;

  const handleAddToCart = async () => {
    if (!selectedVariant || isOutOfStock) return;
    setAdding(true);
    await addItem(product.id, selectedVariant.id, quantity);
    setAdding(false);
    onClose();
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || isOutOfStock) return;
    await addItem(product.id, selectedVariant.id, quantity);
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-luxury-cream w-full max-w-3xl rounded-2xl shadow-2xl border border-luxury-gold/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 text-luxury-espresso hover:text-luxury-wine shadow z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Images */}
          <div className="p-6 bg-luxury-warmWhite flex flex-col justify-between">
            <div className="aspect-[3/4] rounded-lg overflow-hidden border border-luxury-beige/40 shadow-sm">
              <img
                src={selectedImage || product.images[0]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-14 h-16 rounded overflow-hidden border-2 flex-shrink-0 transition-colors ${
                      selectedImage === img.url ? 'border-luxury-wine' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-luxury-gold-dark font-semibold">
                {product.fabric}
              </p>
              <h2 className="font-serif text-xl font-bold text-luxury-espresso mt-1">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-2 flex items-baseline space-x-3">
                <span className="font-serif font-bold text-2xl text-luxury-wine">
                  ₹{unitPrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > unitPrice && (
                  <span className="text-sm text-luxury-espresso/50 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="bg-luxury-wine/10 text-luxury-wine text-xs font-bold px-2 py-0.5 rounded">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-luxury-espresso/80 mt-3 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Variant Selector */}
              {product.variants.length > 0 && (
                <div className="mt-4 space-y-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso">
                    Select Size & Shade:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                          selectedVariant?.id === v.id
                            ? 'bg-luxury-wine text-luxury-ivory border-luxury-wine'
                            : 'bg-white text-luxury-espresso border-luxury-gold/30 hover:border-luxury-gold'
                        }`}
                      >
                        {v.size} ({v.color})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mt-3 text-xs">
                {isOutOfStock ? (
                  <span className="text-rose-700 font-semibold">Currently Out of Stock</span>
                ) : (
                  <span className="text-emerald-800 font-medium">
                    ✓ In Stock ({selectedVariant?.stockQuantity} available)
                  </span>
                )}
              </div>
            </div>

            {/* Actions & Policy Notice */}
            <div className="space-y-3 pt-4 border-t border-luxury-beige/30">
              {/* Policy Banner */}
              <div className="flex items-start space-x-2 bg-amber-50 p-2.5 rounded text-[11px] text-amber-900 border border-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Store Policy:</strong> All sales final. No returns or exchanges on handcrafted heirlooms.
                </span>
              </div>

              {/* Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className="flex-1 bg-luxury-wine hover:bg-luxury-wine-light disabled:opacity-50 text-luxury-ivory py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider shadow flex items-center justify-center space-x-1 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{adding ? 'Adding...' : 'Add to Bag'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 bg-luxury-gold-dark hover:bg-luxury-gold disabled:opacity-50 text-luxury-ivory py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider shadow flex items-center justify-center space-x-1 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-lg border shadow-sm transition-colors ${
                    inWishlist
                      ? 'bg-luxury-wine text-luxury-gold border-luxury-wine'
                      : 'bg-white text-luxury-espresso border-luxury-gold/30 hover:text-luxury-wine'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-luxury-gold' : ''}`} />
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/product/${product.slug}`);
                  }}
                  className="text-xs text-luxury-wine hover:underline"
                >
                  View Full Product Details & Sizing Guide →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

