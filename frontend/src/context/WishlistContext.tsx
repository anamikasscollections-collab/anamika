import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  fabric: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  images: { url: string; altText: string }[];
  variants: { id: string; size: string; color: string; stockQuantity: number }[];
}

interface WishlistContextType {
  items: WishlistProduct[];
  itemCount: number;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  moveToCart: (productId: string, variantId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchWishlist = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data?.success) {
        setItems(res.data.data.items || []);
      }
    } catch (err) {
      console.error('Error fetching wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.id === productId);
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      alert('Please log in or create an account to save items to your royal wishlist.');
      return false;
    }

    try {
      const res = await api.post('/wishlist/toggle', { productId });
      if (res.data?.success) {
        await fetchWishlist();
        return res.data.data.inWishlist;
      }
      return false;
    } catch (err) {
      console.error('Error toggling wishlist', err);
      return false;
    }
  };

  const moveToCart = async (productId: string, variantId: string): Promise<boolean> => {
    try {
      const res = await api.post('/wishlist/move-to-cart', { productId, variantId });
      if (res.data?.success) {
        await fetchWishlist();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        loading,
        isInWishlist,
        toggleWishlist,
        moveToCart,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

