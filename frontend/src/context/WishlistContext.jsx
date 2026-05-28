import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user, token } = useAuth();

  const fetchWishlist = async () => {
    if (!token) {
      setWishlist([]);
      return;
    }
    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user, token]);

  const toggleWishlist = async (product) => {
    if (!token) {
      return { success: false, message: 'Please login to use Wishlist' };
    }

    const isFav = wishlist.some((item) => item._id === product._id);

    try {
      if (isFav) {
        // Remove
        const response = await fetch(`/api/wishlist/${product._id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setWishlist((prev) => prev.filter((item) => item._id !== product._id));
          return { success: true, removed: true };
        }
      } else {
        // Add
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product._id }),
        });
        if (response.ok) {
          setWishlist((prev) => [...prev, product]);
          return { success: true, added: true };
        }
      }
    } catch (error) {
      console.error(error);
    }
    return { success: false, message: 'Wishlist sync failed' };
  };

  const inWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, inWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
