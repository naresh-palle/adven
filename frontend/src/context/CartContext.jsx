import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('adven_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [coupon, setCoupon] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    localStorage.setItem('adven_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product === product._id && item.size === size
      );

      const sizeStockObj = product.sizes.find((s) => s.size === size);
      const maxStock = sizeStockObj ? sizeStockObj.stock : 0;

      if (existingIndex > -1) {
        const newQty = Math.min(prev[existingIndex].quantity + quantity, maxStock);
        const updated = [...prev];
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            product: product._id,
            name: product.name,
            image: product.images[0],
            price: product.price,
            size,
            quantity: Math.min(quantity, maxStock),
            maxStock,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prev) => prev.filter((item) => !(item.product === productId && item.size === size)));
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

  // Subtotal in INR
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Apply Coupon
  const applyCouponCode = async (code) => {
    if (!token) {
      return { success: false, message: 'Please login to apply coupons' };
    }

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, cartAmount: subtotal }),
      });

      const data = await response.json();

      if (response.ok) {
        setCoupon(data);
        return { success: true, discountAmount: data.discountAmount };
      } else {
        return { success: false, message: data.message || 'Failed to apply coupon' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Connection error' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Re-calculate coupon discount if subtotal changes
  useEffect(() => {
    if (coupon) {
      let newDiscount = 0;
      if (coupon.discountType === 'flat') {
        newDiscount = coupon.discountValue;
      } else {
        newDiscount = (subtotal * coupon.discountValue) / 100;
      }
      setCoupon((prev) => ({
        ...prev,
        discountAmount: Math.min(newDiscount, subtotal),
      }));
    }
  }, [subtotal]);

  // Tax (18% GST) & Shipping fee (₹150, free above ₹2999)
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
