import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('adven_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupon, setCoupon] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem('adven_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product === product.id && item.size === size
      );

      // Support both sizes as array of objects {size, stock} or plain strings
      const sizeStockObj = Array.isArray(product.sizes)
        ? product.sizes.find((s) => (typeof s === 'object' ? s.size === size : s === size))
        : null;
      const maxStock = sizeStockObj?.stock ?? product.stock ?? 99;

      if (existingIndex > -1) {
        const newQty = Math.min(prev[existingIndex].quantity + quantity, maxStock);
        const updated = [...prev];
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            product: product.id,
            name: product.name,
            image: product.image_urls?.[0] || '',
            price: product.discount_price || product.price,
            size,
            quantity: Math.min(quantity, maxStock),
            maxStock,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product === productId && item.size === size))
    );
  };

  const updateQuantity = (productId, size, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product === productId && item.size === size
          ? { ...item, quantity: Math.min(Math.max(1, quantity), item.maxStock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Coupon validation via Supabase (coupons table if added later, else disable)
  const applyCouponCode = async (code) => {
    if (!user) return { success: false, message: 'Please login to apply coupons' };
    // Placeholder — add coupon logic when coupons table is set up in Supabase
    return { success: false, message: 'Coupon system coming soon' };
  };

  const removeCoupon = () => setCoupon(null);

  // Re-calculate discount if subtotal changes
  useEffect(() => {
    if (coupon) {
      let newDiscount = 0;
      if (coupon.discountType === 'flat') {
        newDiscount = coupon.discountValue;
      } else {
        newDiscount = (subtotal * coupon.discountValue) / 100;
      }
      setCoupon((prev) => ({ ...prev, discountAmount: Math.min(newDiscount, subtotal) }));
    }
  }, [subtotal]);

  const discountAmount = coupon ? coupon.discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxPrice = Math.round(taxableAmount * 0.18);
  const shippingPrice = taxableAmount > 2999 || taxableAmount === 0 ? 0 : 150;
  const totalPrice = taxableAmount + taxPrice + shippingPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
        subtotal,
        discountAmount,
        taxPrice,
        shippingPrice,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
