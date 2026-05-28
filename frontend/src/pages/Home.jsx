import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, ChevronRight, Play, Eye, ShoppingBag } from 'lucide-react';

const CATEGORIES_LIST = [
  { name: 'T-Shirts', category: 'Classics', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80' },
  { name: 'Shirts', category: 'Classics', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80' },
  { name: 'Trousers', category: 'Classics', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80' },
  { name: 'Jeans', category: 'Classics', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80' },
  { name: 'Cotton Shorts', category: 'Utility', img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop&q=80' },
  { name: 'Cargos', category: 'Utility', img: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80' },
  { name: 'Sports Trousers', category: 'Activewear', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=80' },
  { name: 'Sports Shorts', category: 'Activewear', img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop&q=80' },
];

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
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
          setFilteredProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === 'All') {
      setFilteredProducts(featuredProducts);
    } else if (filter === 'Tops') {
      setFilteredProducts(featuredProducts.filter(p => ['T-Shirts', 'Shirts'].includes(p.category)));
    } else if (filter === 'Bottoms') {
      setFilteredProducts(featuredProducts.filter(p => ['Trousers', 'Jeans', 'Cargos', 'Cotton Shorts', 'Sports Trousers', 'Sports Shorts'].includes(p.category)));
    } else if (filter === 'Active') {
      setFilteredProducts(featuredProducts.filter(p => p.category.includes('Sports')));
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '120px', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION (Zara Layout + Nike Boldness) */}
      <section style={{
        position: 'relative',
        height: 'calc(100vh - var(--navbar-height))',
        minHeight: '650px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(rgba(10,10,12,0.4) 0%, rgba(10,10,12,0.9) 100%), url("https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        overflow: 'hidden'
      }}>
        {/* Decorative Grid Lines (Zara style) */}
        <div className="zara-lines-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          pointerEvents: 'none',
          opacity: 0.15
        }}>
          <div style={{ borderRight: '1px solid #fff' }}></div>
          <div style={{ borderRight: '1px solid #fff' }}></div>
          <div style={{ borderRight: '1px solid #fff' }}></div>
          <div></div>
        </div>

        <div className="container" style={{ width: '100%', position: 'relative', zIndex: 5 }}>
          <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="hero-badge-anim">
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'hsl(var(--primary))'
              }}>ADVEN / ATELIER EDITION</span>
              <div style={{ width: '40px', height: '1px', background: 'hsl(var(--primary))' }}></div>
            </div>

            <h1 className="hero-title" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 7vw, 6.5rem)',
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase'
            }}>
              SARTORIAL <br />
              <span className="gold-text">ESCAPE.</span>
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              color: 'hsl(var(--text-secondary))',
              lineHeight: '1.7',
              maxWidth: '600px',
              fontFamily: 'var(--font-body)',
              fontWeight: 300
            }}>
              Discover technical fabrics fused with Zara-inspired high tailoring. Engineered for movement, crafted in pure luxury.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
              <Link to="/shop" className="btn btn-primary" style={{ padding: '18px 40px', fontSize: '0.85rem' }}>
                EXPLORE COLLECTION <ArrowRight size={16} />
              </Link>
              <button 
                onClick={() => {
                  const element = document.getElementById('lookbook-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="btn btn-secondary" 
                style={{ padding: '18px 32px', fontSize: '0.85rem' }}
              >
                VIEW LOOKBOOK <Play size={14} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. ZARA-INSPIRED ASYMMETRIC LOOKBOOK (Editorial Split) */}
      <section id="lookbook-section" className="container" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '40px', alignItems: 'center' }} className="lookbook-grid">
          
          {/* Big Asymmetric Image Left */}
          <div style={{ gridColumn: 'span 7', position: 'relative' }} className="lookbook-main-col">
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              height: '620px',
              border: '1px solid rgba(255,255,255,0.05)'
            }} className="scale-img-container">
              <img 
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80" 
                alt="Zara Style Menswear" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '32px',
                left: '32px',
                zIndex: 2,
                maxWidth: '380px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.2em', color: 'hsl(var(--primary))' }}>CHAPTER I</span>
                <h3 style={{ fontSize: '1.8rem', textTransform: 'uppercase', lineHeight: 1.1 }}>THE TAILORED FORM</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                  A study in structure and geometry. Organic linen and pima cotton, woven to move without friction.
                </p>
              </div>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.1) 60%)',
                pointerEvents: 'none'
              }}></div>
            </div>
          </div>

          {/* Staggered Right Side Text & Secondary Image */}
          <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '48px', paddingLeft: '20px' }} className="lookbook-side-col">
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
                EDITORIAL / COLLECTION '26
              </span>
              <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', lineHeight: 1.05 }}>
                MINIMALIST <br />
                ARCHITECTURE.
              </h2>
              <div style={{ width: '60px', height: '2px', backgroundColor: 'hsl(var(--primary))' }}></div>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem', lineHeight: 1.7, fontWeight: 300 }}>
                Inspired by the clean silhouettes of Zara lookbooks and the technical execution of Nike sportswear, Adven brings a new vocabulary to menswear. Unstructured blazers, utility cargos, and fluid t-shirts.
              </p>
              <Link to="/shop" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'hsl(var(--primary))',
                letterSpacing: '0.1em'
              }} className="hover-underline">
                VIEW THE ESSENTIALS <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              height: '280px',
              border: '1px solid rgba(255,255,255,0.05)'
            }} className="scale-img-container">
              <img 
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80" 
                alt="Technical Wear Detail" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
              />
            </div>

          </div>

        </div>
      </section>

      {/* 3. DEPARTMENT SLIDER (Classics / Utility / Activewear) */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '64px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'hsl(var(--primary))' }}>Department Divisions</span>
          <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase' }}>Shop by Division</h2>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'hsl(var(--primary))', margin: '0 auto' }}></div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px'
        }} className="department-grid">
          
          {/* Classics Department */}
          <div className="dept-card" style={{
            position: 'relative',
            height: '480px',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80" 
              alt="Classics Department" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
            />
            <div className="dept-overlay" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.1) 70%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '40px',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CLASSICS</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: 300 }}>
                Tailored shirts, raw selvedge indigo denims, and organic linen shirts.
              </p>
              <Link to="/shop?category=Shirts" className="btn btn-secondary" style={{ padding: '10px 20px', width: 'fit-content', fontSize: '0.75rem', marginTop: '8px' }}>
                EXPLORE CLASSICS
              </Link>
            </div>
          </div>

          {/* Utility Department */}
          <div className="dept-card" style={{
            position: 'relative',
            height: '480px',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80" 
              alt="Utility Department" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
            />
            <div className="dept-overlay" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.1) 70%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '40px',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>UTILITY</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: 300 }}>
                Modern cargo utility pants, heavy-duty twill chino shorts, and functional pockets.
              </p>
              <Link to="/shop?category=Cargos" className="btn btn-secondary" style={{ padding: '10px 20px', width: 'fit-content', fontSize: '0.75rem', marginTop: '8px' }}>
                EXPLORE UTILITY
              </Link>
            </div>
          </div>

          {/* Activewear Department (Nike Inspired) */}
          <div className="dept-card" style={{
            position: 'relative',
            height: '480px',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80" 
              alt="Activewear Department" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
            />
            <div className="dept-overlay" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.1) 70%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '40px',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIVEWEAR</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: 300 }}>
                Four-way stretch joggers, mesh ventilation running shorts, and active gear.
              </p>
              <Link to="/shop?category=Sports Trousers" className="btn btn-secondary" style={{ padding: '10px 20px', width: 'fit-content', fontSize: '0.75rem', marginTop: '8px' }}>
                EXPLORE ACTIVEWEAR
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. NIKE-STYLE HIGHLIGHT (Active Motion Banner) */}
      <section style={{
        position: 'relative',
        height: '480px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(10,10,12,0.95) 30%, rgba(10,10,12,0.4) 100%), url("https://images.unsplash.com/photo-1483721310020-03333e577078?w=1600&auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div className="container" style={{ width: '100%' }}>
          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.3em', color: 'hsl(var(--primary))' }}>NIKE PERFORMANCE X ZARA LUXE</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', textTransform: 'uppercase', fontWeight: 800, lineHeight: 1.05 }}>
              ENGINEERED FOR <br />
              HIGH MOTION.
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 300 }}>
              Discover running shorts with premium silk-touch liners, sweat-wicking lightweight track pants, and organic Peruvian Pima cotton t-shirts that breathe with your body.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <Link to="/shop?category=Sports Shorts" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                SHOP ATHLETICS
              </Link>
              <Link to="/shop" className="btn btn-secondary" style={{ padding: '12px 28px' }}>
                THE ESSENTIALS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL PRODUCT SHOWCASE (Featured essentials with filter tabs) */}
      <section className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '56px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '24px'
        }} className="showcase-header">
          
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'hsl(var(--primary))', display: 'block', marginBottom: '8px' }}>Curated Selection</span>
            <h2 style={{ fontSize: '2.2rem', textTransform: 'uppercase' }}>Featured Essentials</h2>
          </div>

          {/* Filtering Tabs */}
          <div style={{ display: 'flex', gap: '24px' }} className="showcase-tabs">
            {['All', 'Tops', 'Bottoms', 'Active'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: activeFilter === filter ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                  position: 'relative',
                  padding: '8px 0',
                  cursor: 'pointer',
                  borderBottom: activeFilter === filter ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {filter}
              </button>
            ))}
          </div>

        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="loader"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'hsl(var(--text-secondary))' }}>
            No products found matching this department.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '30px'
          }}>
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. THE ZARA CATEGORY GRID */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '56px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'hsl(var(--primary))' }}>Luxe Taxonomy</span>
          <h2 style={{ fontSize: '2.2rem', textTransform: 'uppercase' }}>Department Taxonomy</h2>
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
                height: '340px',
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
                  filter: 'brightness(0.65)',
                  transition: 'transform var(--transition-slow)'
                }}
              />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', color: 'hsl(var(--primary))', textTransform: 'uppercase' }}>
                  {category.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category.name}</h3>
                
                <span className="shop-now-label" style={{ 
                  fontSize: '0.75rem', 
                  color: 'hsl(var(--primary))', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: 0,
                  transform: 'translateX(-5px)',
                  transition: 'all var(--transition-normal)',
                  marginTop: '4px'
                }}>
                  VIEW GROUP <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. THE ADVEN JOURNAL (Zara Minimalist Newsletter Privée) */}
      <section className="container" style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '64px',
          padding: '80px 48px',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255,255,255,0.01)',
          alignItems: 'center'
        }} className="newsletter-grid">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.3em', color: 'hsl(var(--primary))' }}>L'INVITATION PRIVÉE</span>
            <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', lineHeight: 1.1 }}>
              SUBSCRIBE TO <br />
              THE ADVEN JOURNAL.
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 300 }}>
              Receive seasonal lookbooks, private pre-sale invites, and exclusive insights on new technical materials. Minimalist. Non-intrusive.
            </p>
          </div>

          <div>
            {newsletterSubscribed ? (
              <div className="badge badge-gold" style={{ padding: '16px 24px', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}>
                Thank you! You are now subscribed to the Adven Journal.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input 
                    type="email" 
                    placeholder="ENTER YOUR EMAIL ADDRESS" 
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      background: 'transparent', 
                      border: 'none', 
                      borderBottom: '1px solid hsl(var(--border-color))',
                      padding: '16px 0',
                      borderRadius: 0,
                      fontSize: '0.9rem',
                      letterSpacing: '0.1em'
                    }}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
                  JOIN CLUB
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {styleInjection}
    </div>
  );
};

// Custom styles injection for animations and responsiveness
const styleInjection = (
  <style>{`
    /* Zara & Nike custom styling effects */
    .scale-img-container {
      overflow: hidden;
    }
    .scale-img-container:hover img {
      transform: scale(1.05);
    }
    
    .dept-card {
      transition: all var(--transition-slow);
    }
    .dept-card:hover {
      border-color: rgba(212, 175, 55, 0.25);
    }
    .dept-card:hover img {
      transform: scale(1.04);
    }
    
    .category-card:hover img {
      transform: scale(1.08);
      filter: brightness(0.4) !important;
    }
    .category-card:hover .shop-now-label {
      opacity: 1 !important;
      transform: translateX(0) !important;
    }
    .category-card:hover {
      border-color: rgba(212, 175, 55, 0.25);
    }
    
    .hover-underline {
      position: relative;
    }
    .hover-underline::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 1px;
      background-color: hsl(var(--primary));
      transition: width var(--transition-normal);
    }
    .hover-underline:hover::after {
      width: 100%;
    }

    /* Hero entrance animations */
    .hero-badge-anim {
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .hero-title {
      animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
    }

    /* Responsiveness updates */
    @media (max-width: 992px) {
      .lookbook-grid {
        grid-template-columns: 1fr !important;
        gap: 30px !important;
      }
      .lookbook-main-col, .lookbook-side-col {
        grid-column: span 12 !important;
        padding-left: 0 !important;
      }
      .department-grid {
        grid-template-columns: 1fr !important;
        gap: 24px !important;
      }
      .newsletter-grid {
        grid-template-columns: 1fr !important;
        gap: 40px !important;
        padding: 48px 24px !important;
      }
    }
    
    @media (max-width: 768px) {
      .showcase-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 20px !important;
      }
      .showcase-tabs {
        width: 100% !important;
        justify-content: flex-start !important;
        overflow-x: auto !important;
        padding-bottom: 8px !important;
      }
    }
  `}</style>
);
