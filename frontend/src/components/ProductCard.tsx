import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    fabric: string;
    originalPrice: number; // in paise
    discountedPrice: number; // in paise
    discountPercent: number;
    images: { url: string; altText: string }[];
    variants: { id: string; size: string; color: string; stockQuantity: number }[];
    isNewArrival?: boolean;
    isBestseller?: boolean;
  };
  onQuickView?: (product: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const inWishlist = isInWishlist(product.id);
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const primaryImage = product.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c';
  const secondaryImage = product.images[1]?.url || primaryImage;

  const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
  const isOutOfStock = totalStock <= 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultVariant = product.variants[0];
    if (defaultVariant) {
      setAddingToCart(true);
      await addItem(product.id, defaultVariant.id, 1);
      setAddingToCart(false);
    }
  };

  return (
    <div
      className="group relative bg-white border border-luxury-beige/30 rounded-lg overflow-hidden shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[3/4] bg-luxury-warmWhite overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={hovered ? secondaryImage : primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1 z-10">
          {product.discountPercent > 0 && (
            <span className="bg-luxury-wine text-luxury-ivory text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase shadow">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-luxury-gold text-luxury-espresso-dark text-[10px] font-semibold px-2 py-0.5 rounded tracking-wider uppercase shadow">
              Bestseller
            </span>
          )}
          {product.isNewArrival && !product.isBestseller && (
            <span className="bg-luxury-beige text-luxury-espresso text-[10px] font-semibold px-2 py-0.5 rounded tracking-wider uppercase shadow">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all duration-200 z-10 ${
            inWishlist
              ? 'bg-luxury-wine text-luxury-gold'
              : 'bg-white/80 hover:bg-white text-luxury-espresso hover:text-luxury-wine'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-luxury-gold' : ''}`} />
        </button>

        {/* Quick View & Quick Add Overlays (on Desktop Hover) */}
        <div className="absolute inset-x-3 bottom-3 hidden md:flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 bg-white/95 hover:bg-white text-luxury-espresso text-xs font-medium py-2 rounded shadow flex items-center justify-center space-x-1 border border-luxury-gold/30 hover:border-luxury-gold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          )}

          {!isOutOfStock && (
            <button
              onClick={handleQuickAdd}
              disabled={addingToCart}
              className="bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory p-2 rounded shadow transition-colors"
              title="Add to Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-luxury-espresso text-luxury-ivory text-xs font-semibold uppercase tracking-widest px-3 py-1 border border-luxury-gold/40">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-luxury-gold-dark font-medium mb-1">
            {product.fabric}
          </p>
          <Link
            to={`/product/${product.slug}`}
            className="block font-serif text-sm font-medium text-luxury-espresso hover:text-luxury-wine transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Availability */}
        <div className="mt-3 pt-2 border-t border-luxury-beige/20 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-serif font-bold text-base text-luxury-wine">
              ₹{(product.discountedPrice / 100).toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.discountedPrice && (
              <span className="text-xs text-luxury-espresso/50 line-through">
                ₹{(product.originalPrice / 100).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <span
            className={`text-[10px] font-medium tracking-wider uppercase ${
              isOutOfStock ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {isOutOfStock ? 'Sold Out' : 'In Stock'}
          </span>
        </div>
      </div>
    </div>
  );
};

