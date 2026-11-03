import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  sku: string;
  size: string;
  color: string;
  colorCode?: string;
  quantity: number;
  stockAvailable: number;
  unitPricePaise: number;
  originalPricePaise: number;
  lineTotalPaise: number;
}

export interface CouponDetails {
  code: string;
  discountPaise: number;
  discountRupees: number;
  description?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotalPaise: number;
  shippingPaise: number;
  shippingNote: string;
  discountPaise: number;
  totalPaise: number;
  isCartOpen: boolean;
  appliedCoupon: CouponDetails | null;
  loading: boolean;
  deliveryPincode: string;
  setDeliveryPincode: (pin: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (productId: string, variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, variantId: string, quantity: number) => Promise<boolean>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState<number>(0);
  const [subtotalPaise, setSubtotalPaise] = useState<number>(0);
  const [shippingPaise, setShippingPaise] = useState<number>(0);
  const [shippingNote, setShippingNote] = useState<string>('Free shipping over ₹5,000 or enter PIN');
  const [deliveryPincode, setDeliveryPincode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDetails | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const params = deliveryPincode ? { pincode: deliveryPincode } : {};
      const res = await api.get('/cart', { params });
      if (res.data?.success) {
        const data = res.data.data;
        setItems(data.items || []);
        setItemCount(data.itemCount || 0);
        setSubtotalPaise(data.subtotalPaise || 0);
        setShippingPaise(data.shippingPaise || 0);
        setShippingNote(data.shippingNote || '');
      }
    } catch (err) {
      console.error('Error fetching cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [deliveryPincode]);

  const discountPaise = appliedCoupon ? appliedCoupon.discountPaise : 0;
  const totalPaise = Math.max(0, subtotalPaise - discountPaise + shippingPaise);

  const addItem = async (productId: string, variantId: string, quantity: number = 1): Promise<boolean> => {
    try {
      setLoading(true);
      // Find current quantity if already in cart
      const existing = items.find((i) => i.variantId === variantId);
      const newQty = (existing?.quantity || 0) + quantity;

      const res = await api.post('/cart/items', {
        productId,
        variantId,
        quantity: newQty,
      });

      if (res.data?.success) {
        await fetchCart();
        setIsCartOpen(true);
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, variantId: string, quantity: number): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.post('/cart/items', {
        productId,
        variantId,
        quantity,
      });
      if (res.data?.success) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update quantity');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (variantId: string) => {
    try {
      await api.delete(`/cart/items/${variantId}`);
      await fetchCart();
    } catch (err) {
      console.error('Error removing item', err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setItems([]);
      setItemCount(0);
      setSubtotalPaise(0);
      setAppliedCoupon(null);
    } catch (err) {
      console.error('Error clearing cart', err);
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.post('/coupons/validate', {
        code,
        subtotalPaise,
      });

      if (res.data?.success) {
        const couponData = res.data.data;
        setAppliedCoupon(couponData);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid coupon code',
      };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalPaise,
        shippingPaise,
        shippingNote,
        discountPaise,
        totalPaise,
        isCartOpen,
        appliedCoupon,
        loading,
        deliveryPincode,
        setDeliveryPincode,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen(!isCartOpen),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

