import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, ChevronRight, Play, ShoppingBag } from 'lucide-react';

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
    <div className="flex flex-col gap-20 md:gap-32 overflow-x-hidden animate-fade-in">
      
      {/* 1. HERO SECTION (Zara Layout + Nike Boldness) */}
      <section className="relative h-[calc(100vh-80px)] min-h-[600px] w-full flex items-center bg-gradient-to-b from-black/40 to-black/90 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-[center_30%] overflow-hidden">
        {/* Decorative Grid Lines (Zara style) */}
        <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-15 z-0">
          <div className="border-r border-white/40 h-full"></div>
          <div className="border-r border-white/40 h-full"></div>
          <div className="border-r border-white/40 h-full"></div>
          <div className="h-full"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
          <div className="max-w-[800px] flex flex-col gap-6 md:gap-8">
            
            <div className="flex items-center gap-4 animate-fade-in duration-700">
              <span className="font-display text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                ADVEN / ATELIER EDITION
              </span>
              <div className="w-10 h-[1px] bg-primary"></div>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter uppercase animate-fade-in duration-1000">
              SARTORIAL <br />
              <span className="gold-text">ESCAPE.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-xl text-text-secondary leading-relaxed max-w-[600px] font-body font-light">
              Discover technical fabrics fused with Zara-inspired high tailoring. Engineered for movement, crafted in pure luxury.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Link to="/shop" className="btn btn-primary !py-4 !px-8 text-xs sm:text-sm">
                EXPLORE COLLECTION <ArrowRight size={16} />
              </Link>
              <button 
                onClick={() => {
                  const element = document.getElementById('lookbook-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="btn btn-secondary !py-4 !px-6 text-xs sm:text-sm"
              >
                VIEW LOOKBOOK <Play size={14} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. ZARA-INSPIRED ASYMMETRIC LOOKBOOK (Editorial Split) */}
      <section id="lookbook-section" className="container mx-auto px-4 md:px-6 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Big Asymmetric Image Left */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-sm overflow-hidden h-[400px] sm:h-[550px] md:h-[620px] border border-white/5 group">
              <img 
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80" 
                alt="Zara Style Menswear" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10 max-w-[90%] md:max-w-[380px] flex flex-col gap-3">
                <span className="text-xs font-semibold tracking-[0.2em] text-primary">CHAPTER I</span>
                <h3 className="text-xl md:text-2xl font-bold uppercase leading-tight text-white">THE TAILORED FORM</h3>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-light">
                  A study in structure and geometry. Organic linen and pima cotton, woven to move without friction.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Staggered Right Side Text & Secondary Image */}
          <div className="lg:col-span-5 flex flex-col gap-8 lg:pl-6">
            
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-primary uppercase tracking-[0.25em]">
                EDITORIAL / COLLECTION '26
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold uppercase leading-tight">
                MINIMALIST <br />
                ARCHITECTURE.
              </h2>
              <div className="w-14 h-[2px] bg-primary"></div>
              <p className="text-text-secondary text-sm md:text-base leading-relaxed font-light mt-2">
                Inspired by the clean silhouettes of Zara lookbooks and the technical execution of Nike sportswear, Adven brings a new vocabulary to menswear. Unstructured blazers, utility cargos, and fluid t-shirts.
              </p>
              <Link to="/shop" className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-primary tracking-wider hover:underline w-fit mt-2">
                VIEW THE ESSENTIALS <ChevronRight size={16} />
              </Link>
            </div>

            <div className="relative rounded-sm overflow-hidden h-[200px] sm:h-[280px] border border-white/5 group">
              <img 
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80" 
                alt="Technical Wear Detail" 
                className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-103"
              />
            </div>

          </div>

        </div>
      </section>

      {/* 3. DEPARTMENT SLIDER (Classics / Utility / Activewear) */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Department Divisions</span>
          <h2 className="text-2xl md:text-4xl font-extrabold uppercase">Shop by Division</h2>
          <div className="w-10 h-[2px] bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Classics Department */}
          <div className="relative h-[400px] sm:h-[480px] rounded-sm overflow-hidden border border-white/5 group">
            <img 
              src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80" 
              alt="Classics Department" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-8 gap-3">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wide text-white">CLASSICS</h3>
              <p className="text-xs text-text-secondary font-light">
                Tailored shirts, raw selvedge indigo denims, and organic linen shirts.
              </p>
              <Link to="/shop?category=Shirts" className="btn btn-secondary !py-2 !px-4 !text-xs w-fit mt-1.5">
                EXPLORE CLASSICS
              </Link>
            </div>
          </div>

          {/* Utility Department */}
          <div className="relative h-[400px] sm:h-[480px] rounded-sm overflow-hidden border border-white/5 group">
            <img 
              src="https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80" 
              alt="Utility Department" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-8 gap-3">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wide text-white">UTILITY</h3>
              <p className="text-xs text-text-secondary font-light">
                Modern cargo utility pants, heavy-duty twill chino shorts, and functional pockets.
              </p>
              <Link to="/shop?category=Cargos" className="btn btn-secondary !py-2 !px-4 !text-xs w-fit mt-1.5">
                EXPLORE UTILITY
              </Link>
            </div>
          </div>

          {/* Activewear Department (Nike Inspired) */}
          <div className="relative h-[400px] sm:h-[480px] rounded-sm overflow-hidden border border-white/5 group">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80" 
              alt="Activewear Department" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-8 gap-3">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wide text-white">ACTIVEWEAR</h3>
              <p className="text-xs text-text-secondary font-light">
                Four-way stretch joggers, mesh ventilation running shorts, and active gear.
              </p>
              <Link to="/shop?category=Sports Trousers" className="btn btn-secondary !py-2 !px-4 !text-xs w-fit mt-1.5">
                EXPLORE ACTIVEWEAR
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. NIKE-STYLE HIGHLIGHT (Active Motion Banner) */}
      <section className="relative h-auto py-16 md:py-24 w-full flex items-center bg-gradient-to-r from-black/95 via-black/80 to-black/40 bg-[url('https://images.unsplash.com/photo-1483721310020-03333e577078?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center border-y border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-[600px] flex flex-col gap-4">
            <span className="text-xs font-bold tracking-[0.3em] text-primary">NIKE PERFORMANCE X ZARA LUXE</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase leading-tight text-white">
              ENGINEERED FOR <br />
              HIGH MOTION.
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed font-light">
              Discover running shorts with premium silk-touch liners, sweat-wicking lightweight track pants, and organic Peruvian Pima cotton t-shirts that breathe with your body.
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <Link to="/shop?category=Sports Shorts" className="btn btn-primary !py-3 !px-6 text-xs">
                SHOP ATHLETICS
              </Link>
              <Link to="/shop" className="btn btn-secondary !py-3 !px-6 text-xs">
                THE ESSENTIALS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL PRODUCT SHOWCASE (Featured essentials with filter tabs) */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/5 pb-4 gap-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-2">Curated Selection</span>
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase">Featured Essentials</h2>
          </div>

          {/* Filtering Tabs */}
          <div className="flex gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none shrink-0">
            {['All', 'Tops', 'Bottoms', 'Active'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`text-xs font-semibold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                  activeFilter === filter ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-secondary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loader"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-sm text-text-secondary">
            No products found matching this department.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 7. THE ADVEN JOURNAL (Zara Minimalist Newsletter Privée) */}
      <section className="container mx-auto px-4 md:px-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 py-12 px-6 sm:py-16 sm:px-12 border border-white/5 rounded-sm bg-white/[0.01] items-center">
          
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold tracking-[0.3em] text-primary">L'INVITATION PRIVÉE</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase leading-tight">
              SUBSCRIBE TO <br />
              THE ADVEN JOURNAL.
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed font-light">
              Receive seasonal lookbooks, private pre-sale invites, and exclusive insights on new technical materials. Minimalist. Non-intrusive.
            </p>
          </div>

          <div>
            {newsletterSubscribed ? (
              <div className="badge badge-gold !py-4 w-full justify-center text-center text-xs md:text-sm">
                Thank you! You are now subscribed to the Adven Journal.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4">
                <div className="form-group mb-0">
                  <input 
                    type="email" 
                    placeholder="ENTER YOUR EMAIL ADDRESS" 
                    className="w-full bg-transparent border-b border-border-color/80 py-4 text-sm tracking-wider uppercase focus:border-primary text-white outline-none"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full py-4 text-xs md:text-sm">
                  JOIN CLUB
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};
