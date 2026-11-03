import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export const WishlistPage: React.FC = () => {
  const { items, itemCount, toggleWishlist, moveToCart } = useWishlist();
  const { openCart } = useCart();

  const handleMoveToCart = async (productId: string, variantId: string) => {
    const success = await moveToCart(productId, variantId);
    if (success) {
      openCart();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-luxury-gold/30 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-luxury-wine">
            Saved For Celebrations
          </span>
          <h1 className="font-serif text-3xl font-bold text-luxury-espresso mt-1">
            My Royal Wishlist ({itemCount})
          </h1>
        </div>
        <Link
          to="/category/sarees"
          className="text-xs uppercase tracking-widest font-bold text-luxury-wine hover:text-luxury-wine-light flex items-center space-x-1"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {itemCount === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-luxury-beige/40 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-luxury-wine/10 flex items-center justify-center mx-auto text-luxury-wine">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-luxury-espresso">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-luxury-espresso/60 max-w-sm mx-auto">
            Save your favorite handcrafted Banarasi silks, Kanjivarams, and festive kurtis to cherish or purchase later.
          </p>
          <Link
            to="/category/sarees"
            className="inline-block bg-luxury-wine text-luxury-ivory px-6 py-2.5 rounded text-xs font-semibold uppercase tracking-wider shadow"
          >
            Explore Sarees
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => {
            const defaultVariant = product.variants[0];
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-luxury-beige/40 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-[3/4] relative overflow-hidden bg-luxury-warmWhite">
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-rose-700 shadow"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-luxury-gold-dark tracking-wider">
                      {product.fabric}
                    </span>
                    <Link
                      to={`/product/${product.slug}`}
                      className="block font-serif text-sm font-semibold text-luxury-espresso hover:text-luxury-wine transition-colors line-clamp-1 mt-0.5"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-1 font-serif font-bold text-base text-luxury-wine">
                      ₹{(product.discountedPrice / 100).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {defaultVariant && (
                    <button
                      onClick={() => handleMoveToCart(product.id, defaultVariant.id)}
                      className="w-full bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory text-xs font-semibold uppercase tracking-wider py-2.5 rounded shadow flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

