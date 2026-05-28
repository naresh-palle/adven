import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id, products(*)')
      .eq('user_id', user.id);

    if (!error && data) {
      setWishlist(data.map((row) => row.products));
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) return { success: false, message: 'Please login to use Wishlist' };

    const isFav = wishlist.some((item) => item.id === product.id);

    if (isFav) {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);

      if (!error) {
        setWishlist((prev) => prev.filter((item) => item.id !== product.id));
        return { success: true, removed: true };
      }
    } else {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: product.id });

      if (!error) {
        setWishlist((prev) => [...prev, product]);
        return { success: true, added: true };
      }
    }
    return { success: false, message: 'Wishlist sync failed' };
  };

  const inWishlist = (productId) => wishlist.some((item) => item.id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, inWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
