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

  const isFavorite = inWishlist(product._id);

  // Find if out of stock
  const totalStock = product.sizes.reduce((acc, curr) => acc + curr.stock, 0);
  const isOutOfStock = totalStock === 0;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) return;
    
    setAdding(true);
    // Find the first size that is in stock
    const availableSize = product.sizes.find(s => s.stock > 0);
    const selectedSize = availableSize ? availableSize.size : 'M';
    
    addToCart(product, selectedSize, 1);
    
    setTimeout(() => {
      setAdding(false);
    }, 800);
  };

  return (
    <Link 
      to={`/product/${product._id}`} 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all var(--transition-normal)'
      }}
      className="product-card"
    >
      {/* Product Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '125%', // 4:5 Aspect Ratio
        overflow: 'hidden',
        backgroundColor: '#0f0f13'
      }}>
        {/* Out of Stock Ribbon */}
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'hsl(var(--danger))',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            zIndex: 2
          }}>
            Out of Stock
          </div>
        )}

        {/* Featured Ribbon */}
        {product.featured && !isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'hsl(var(--primary))',
            color: '#000',
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            zIndex: 2
          }}>
            Featured
          </div>
        )}

        {/* Heart Wishlist Button */}
        <button 
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: isFavorite ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.4)',
            border: isFavorite ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255,255,255,0.05)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFavorite ? 'hsl(var(--primary))' : 'hsl(var(--text-primary))',
            zIndex: 2,
            transition: 'all var(--transition-fast)'
          }}
          className="wishlist-btn"
          aria-label="Add to Wishlist"
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Image */}
        <img 
          src={product.images[0]} 
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform var(--transition-slow)'
          }}
          loading="lazy"
        />

        {/* Quick Add Overlay */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            style={{
              position: 'absolute',
              bottom: hovered ? '0' : '-50px',
              left: 0,
              right: 0,
              backgroundColor: 'rgba(10, 10, 12, 0.95)',
              borderTop: '1px solid rgba(212,175,55,0.2)',
              color: 'hsl(var(--text-primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px',
              gap: '8px',
              transition: 'all var(--transition-normal)',
              zIndex: 3
            }}
            className="quick-add-btn"
          >
            <ShoppingCart size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {adding ? 'Adding...' : 'Quick Add'}
            </span>
          </button>
        )}
      </div>

      {/* Info details */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {/* Category */}
        <span style={{
          fontSize: '0.7rem',
          color: 'hsl(var(--text-muted))',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>{product.category}</span>

        {/* Product Title */}
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: 'hsl(var(--text-primary))'
        }}>{product.name}</h4>

        {/* Price & Rating */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px'
        }}>
          {/* Price */}
          <span style={{
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'hsl(var(--primary))'
          }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', color: '#ffb400' }}>
              <Star size={12} fill="currentColor" />
              <span>{product.averageRating}</span>
              <span style={{ color: 'hsl(var(--text-muted))' }}>({product.numberOfReviews})</span>
            </div>
          )}
        </div>
      </div>

      {/* Local styling adjustments */}
      <style>{`
        .product-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.2);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        .wishlist-btn:hover {
          transform: scale(1.1);
        }
      `}</style>
    </Link>
  );
};
