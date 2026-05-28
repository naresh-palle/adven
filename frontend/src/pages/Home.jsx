import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

const CATEGORIES_LIST = [
  { name: 'T-Shirts', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80' },
  { name: 'Shirts', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80' },
  { name: 'Trousers', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80' },
  { name: 'Jeans', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80' },
  { name: 'Cotton Shorts', img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop&q=80' },
  { name: 'Cargos', img: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80' },
  { name: 'Sports Trousers', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=80' },
  { name: 'Sports Shorts', img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop&q=80' },
];

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/products/featured');
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
      
      {/* 1. HERO BANNER */}
      <section style={{
        position: 'relative',
        height: 'calc(90vh - var(--navbar-height))',
        minHeight: '500px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 100%), url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ width: '100%' }}>
          <div style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'hsl(var(--primary))'
            }}>THE AUTUMN-WINTER COLLECTION</span>
            
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}>
              Elegance <br />
              <span className="gold-text">Redefined.</span>
            </h1>
            
            <p style={{
              fontSize: '1.1rem',
              color: 'hsl(var(--text-secondary))',
              lineHeight: '1.7',
              maxWidth: '550px'
            }}>
              Discover premium men's garments tailored from pure materials. Luxury t-shirts, handcrafted shirts, trousers, cargos, and sportswear designed for the modern gentleman.
            </p>
            
            <div style={{ marginTop: '16px' }}>
              <Link to="/shop" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '0.9rem' }}>
                Shop Collection <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '64px'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ color: 'hsl(var(--primary))', padding: '12px', background: 'rgba(212,175,55,0.08)', borderRadius: 'var(--radius-sm)' }}>
              <Truck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Complimentary Shipping</h3>
              <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>Free shipping on premium orders above ₹2,999 within India.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ color: 'hsl(var(--primary))', padding: '12px', background: 'rgba(212,175,55,0.08)', borderRadius: 'var(--radius-sm)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Authentic Luxury</h3>
              <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>Every garment is sourced and certified directly by Adven House.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ color: 'hsl(var(--primary))', padding: '12px', background: 'rgba(212,175,55,0.08)', borderRadius: 'var(--radius-sm)' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Sartorial Exchange</h3>
              <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>Enjoy a seamless, hassle-free 14-day return or size fitting adjustment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'hsl(var(--primary))' }}>Our Categories</span>
          <h2 style={{ fontSize: '2rem', textTransform: 'uppercase' }}>Shop By Product Type</h2>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'hsl(var(--primary))', margin: '0 auto' }}></div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {CATEGORIES_LIST.map((category) => (
            <Link 
              key={category.name}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
              style={{
                position: 'relative',
                height: '320px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '24px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid rgba(255,255,255,0.02)'
              }}
              className="category-card"
            >
              {/* Image background */}
              <img 
                src={category.img} 
                alt={category.name} 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.6)',
                  transition: 'transform var(--transition-slow)'
                }}
              />
              {/* Content overlay */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category.name}</h3>
                <span className="shop-now-label" style={{ 
                  fontSize: '0.75rem', 
                  color: 'hsl(var(--primary))', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: 0,
                  transform: 'translateX(-5px)',
                  transition: 'all var(--transition-normal)'
                }}>
                  Shop Now <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'hsl(var(--primary))', display: 'block', marginBottom: '8px' }}>Curated Selections</span>
            <h2 style={{ fontSize: '2rem', textTransform: 'uppercase' }}>Featured Essentials</h2>
          </div>
          <Link to="/shop" className="btn btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="loader"></div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '30px'
          }}>
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. NEWSLETTER BOX */}
      <section className="container">
        <div className="glass" style={{
          padding: '80px 48px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
          background: 'radial-gradient(circle at center, rgba(212,175,55,0.06) 0%, rgba(10,10,12,0.9) 100%)'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'hsl(var(--primary))' }}>VIP Privilege Club</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Join the Club</h2>
          <p style={{ maxWidth: '600px', fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>
            Subscribe to receive private invitations to seasonal collections, exclusive promotions, and customized fashion lookbooks from Adven designers.
          </p>

          {newsletterSubscribed ? (
            <div className="badge badge-gold" style={{ padding: '12px 24px', fontSize: '0.85rem', marginTop: '16px' }}>
              Thank you! You are now subscribed to Adven newsletter.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              width: '100%',
              maxWidth: '550px',
              marginTop: '16px'
            }}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="form-control"
                style={{ flex: 1, minWidth: '240px' }}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          )}
        </div>
      </section>

      {styleInjection}
    </div>
  );
};

// Inline stylesheet for hover actions
const styleInjection = (
  <style>{`
    .category-card:hover img {
      transform: scale(1.1);
      filter: brightness(0.4) !important;
    }
    .category-card:hover .shop-now-label {
      opacity: 1 !important;
      transform: translateX(0) !important;
    }
    .category-card:hover {
      border-color: rgba(212, 175, 55, 0.2);
    }
  `}</style>
);
