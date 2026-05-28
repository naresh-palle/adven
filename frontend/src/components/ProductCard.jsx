import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { toggleWishlist, inWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Supabase uses `id` (uuid), `image_urls` (text[]), `sizes` (text[]), `stock` (integer)
  const productId = product.id || product._id;
  const imageUrl = product.image_urls?.[0] || product.images?.[0] || '';
  const isOutOfStock = !product.stock || product.stock === 0;
  const isFavorite = inWishlist(productId);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ ...product, id: productId });
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setAdding(true);
    // Pick first available size string
    const selectedSize = product.sizes?.[0] || 'M';
    addToCart({ ...product, id: productId }, selectedSize, 1);
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <Link
      to={`/product/${productId}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col bg-white/[0.02] border border-white/[0.04] rounded-sm overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl group"
    >
      {/* Product Image Container */}
      <div className="relative w-full pt-[125%] overflow-hidden bg-[#0f0f13] shrink-0">
        {/* Out of Stock Ribbon */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 bg-danger text-white font-display text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm z-10">
            Out of Stock
          </div>
        )}

        {/* Featured Ribbon */}
        {product.featured && !isOutOfStock && (
          <div className="absolute top-3 left-3 bg-primary text-black font-display text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm z-10">
            Featured
          </div>
        )}

        {/* Heart Wishlist Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all ${
            isFavorite ? 'bg-primary/20 border border-primary/40 text-primary' : 'bg-black/45 border border-white/5 text-text-primary hover:scale-105'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Image */}
        <img
          src={imageUrl}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-105' : 'scale-100'}`}
          loading="lazy"
        />

        {/* Quick Add Overlay */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-0 left-0 right-0 bg-black/95 border-t border-primary/20 text-text-primary flex items-center justify-center py-3 gap-2 transition-transform duration-300 z-10 lg:translate-y-12 lg:group-hover:translate-y-0"
          >
            <ShoppingCart size={13} className="shrink-0" />
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">
              {adding ? 'Adding...' : 'Quick Add'}
            </span>
          </button>
        )}
      </div>

      {/* Info details */}
      <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 flex-1 min-w-0">
        <span className="text-[9px] md:text-[10px] text-text-muted uppercase tracking-wider block">
          {product.category}
        </span>
        <h4 className="text-xs md:text-sm font-medium text-text-primary truncate block">
          {product.name}
        </h4>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm md:text-base font-bold font-display text-primary">
            ₹{(product.discount_price || product.price).toLocaleString('en-IN')}
          </span>
          {product.discount_price && product.discount_price < product.price && (
            <span className="text-[10px] text-text-muted line-through">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
