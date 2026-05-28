import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Heart } from 'lucide-react';

export const Wishlist = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div style={{ display: 'inline-flex', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', marginBottom: '24px', color: 'hsl(var(--text-muted))' }}>
          <Heart size={48} />
        </div>
        <h2 style={{ fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>Your Wishlist is Empty</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px auto' }}>
          Browse our premium catalog and save your favorite linen shirts, selvedge jeans, and chinos here.
        </p>
        <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', marginBottom: '40px' }}>Your Wishlist</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '30px'
      }}>
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};
