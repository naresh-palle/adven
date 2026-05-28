import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Heart } from 'lucide-react';

export const Wishlist = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="inline-flex p-6 bg-white/[0.02] border border-white/5 rounded-full mb-6 text-text-muted">
          <Heart size={48} />
        </div>
        <h2 className="text-2xl font-extrabold uppercase mb-3">Your Wishlist is Empty</h2>
        <p className="text-text-secondary mb-8 max-w-sm mx-auto text-sm leading-relaxed font-light">
          Browse our premium catalog and save your favorite linen shirts, selvedge jeans, and chinos here.
        </p>
        <Link to="/shop" className="btn btn-primary !py-3.5 !px-8">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-10 pb-16 min-h-[80vh] animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide mb-10">Your Wishlist</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};
