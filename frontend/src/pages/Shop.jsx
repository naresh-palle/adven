import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Trousers',
  'Jeans',
  'Cotton Shorts',
  'Cargos',
  'Sports Trousers',
  'Sports Shorts',
];

const SIZES = ['S', 'M', 'L', 'XL', '30', '32', '34', '36'];

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mobile filter drawer state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filters state from query parameters or default
  const activeCategory = searchParams.get('category') || '';
  const activeSearch = searchParams.get('search') || '';
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeSize = searchParams.get('size') || '';
  const activeSortBy = searchParams.get('sortBy') || '';

  // Local filter controls (updated before applying)
  const [category, setCategory] = useState(activeCategory);
  const [minPrice, setMinPrice] = useState(activeMinPrice);
  const [maxPrice, setMaxPrice] = useState(activeMaxPrice);
  const [size, setSize] = useState(activeSize);
  const [sortBy, setSortBy] = useState(activeSortBy);

  // Sync state if URL query parameters change
  useEffect(() => {
    setCategory(activeCategory);
    setMinPrice(activeMinPrice);
    setMaxPrice(activeMaxPrice);
    setSize(activeSize);
    setSortBy(activeSortBy);
  }, [activeCategory, activeSearch, activeMinPrice, activeMaxPrice, activeSize, activeSortBy]);

  // Fetch products whenever active filters in URL update
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?`;
        const params = new URLSearchParams();
        
        if (activeCategory) params.append('category', activeCategory);
        if (activeSearch) params.append('search', activeSearch);
        if (activeMinPrice) params.append('minPrice', activeMinPrice);
        if (activeMaxPrice) params.append('maxPrice', activeMaxPrice);
        if (activeSize) params.append('size', activeSize);
        if (activeSortBy) params.append('sortBy', activeSortBy);
        
        url += params.toString();

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [searchParams]);

  // Apply filters to URL search parameters
  const handleApplyFilters = () => {
    const newParams = {};
    if (category) newParams.category = category;
    if (activeSearch) newParams.search = activeSearch;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    if (size) newParams.size = size;
    if (sortBy) newParams.sortBy = sortBy;

    setSearchParams(newParams);
    setFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSize('');
    setSortBy('');
    setSearchParams(activeSearch ? { search: activeSearch } : {});
    setFilterDrawerOpen(false);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    
    // Proactively apply sort immediately
    const newParams = { ...Object.fromEntries(searchParams.entries()) };
    if (val) {
      newParams.sortBy = val;
    } else {
      delete newParams.sortBy;
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', minHeight: '80vh' }}>
      
      {/* Header and Controls summary */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '20px',
        marginBottom: '40px',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            {activeCategory ? activeCategory : 'All Garments'}
          </h1>
          {activeSearch && (
            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
              Search results for: <strong>"{activeSearch}"</strong>
            </p>
          )}
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
            Showing {products.length} products
          </p>
        </div>

        {/* Sort & Mobile filter buttons */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Mobile Filter Toggle */}
          <button 
            className="btn btn-secondary mobile-filter-btn" 
            style={{ display: 'flex', gap: '8px', padding: '10px 16px', fontSize: '0.85rem' }}
            onClick={() => setFilterDrawerOpen(true)}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          {/* Sort Selection */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid hsl(var(--border-color))',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 12px',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <ArrowUpDown size={14} style={{ color: 'hsl(var(--text-muted))' }} />
            <select 
              value={sortBy} 
              onChange={handleSortChange}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--text-secondary))',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
                padding: '6px 0'
              }}
            >
              <option value="" style={{ background: '#121216' }}>Sort By: Featured</option>
              <option value="price-low" style={{ background: '#121216' }}>Price: Low to High</option>
              <option value="price-high" style={{ background: '#121216' }}>Price: High to Low</option>
              <option value="rating" style={{ background: '#121216' }}>Rating: Highest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main layout body */}
      <div style={{ display: 'flex', gap: '40px' }}>
        
        {/* Desktop Sidebar Filters */}
        <aside className="desktop-sidebar-filters" style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Category Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => setCategory('')} 
                style={{
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  color: category === '' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                  fontWeight: category === '' ? 600 : 400
                }}
              >
                All Products
              </button>
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)} 
                  style={{
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    color: category === cat ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                    fontWeight: category === cat ? 600 : 400
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sizes</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSize(size === sz ? '' : sz)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid',
                    borderColor: size === sz ? 'hsl(var(--primary))' : 'hsl(var(--border-color))',
                    backgroundColor: size === sz ? 'rgba(212,175,55,0.08)' : 'transparent',
                    color: size === sz ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                    fontSize: '0.85rem',
                    fontWeight: size === sz ? 600 : 400,
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Range (₹)</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="number" 
                placeholder="Min" 
                className="form-control" 
                style={{ padding: '8px 12px', width: '90px' }}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span style={{ color: 'hsl(var(--text-muted))' }}>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                className="form-control" 
                style={{ padding: '8px 12px', width: '90px' }}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <button className="btn btn-primary" onClick={handleApplyFilters} style={{ width: '100%' }}>Apply Filters</button>
            <button className="btn btn-secondary" onClick={handleClearFilters} style={{ width: '100%' }}>Clear Filters</button>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div className="loader"></div>
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 24px',
              border: '1px dashed hsl(var(--border-color))',
              borderRadius: 'var(--radius-md)'
            }}>
              <h3 style={{ fontSize: '1.2rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>No garments found</h3>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', marginBottom: '24px' }}>
                We couldn't find any products matching your active filter criteria.
              </p>
              <button className="btn btn-secondary" onClick={handleClearFilters}>View All Products</button>
            </div>
          ) : (
            <div className="shop-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '24px'
            }}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Filter Drawer Overlay (Mobile/Tablet) */}
      {filterDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 999
        }} onClick={() => setFilterDrawerOpen(false)}>
          <div className="glass animate-fade-in" style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '320px',
            bottom: 0,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: 'var(--shadow-lg)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}>Filter Garments</h3>
              <button className="btn-text" onClick={() => setFilterDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Content list (Scrollable) */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingRight: '4px' }}>
              
              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))' }}>Categories</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button 
                    onClick={() => setCategory('')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      border: '1px solid',
                      borderColor: category === '' ? 'hsl(var(--primary))' : 'hsl(var(--border-color))',
                      color: category === '' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))'
                    }}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        border: '1px solid',
                        borderColor: category === cat ? 'hsl(var(--primary))' : 'hsl(var(--border-color))',
                        color: category === cat ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))' }}>Sizes</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSize(size === sz ? '' : sz)}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '1px solid',
                        borderColor: size === sz ? 'hsl(var(--primary))' : 'hsl(var(--border-color))',
                        color: size === sz ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))' }}>Price Range (₹)</h4>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="form-control" 
                    style={{ padding: '8px 12px', width: '110px' }}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span style={{ color: 'hsl(var(--text-muted))' }}>-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="form-control" 
                    style={{ padding: '8px 12px', width: '110px' }}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button className="btn btn-secondary" onClick={handleClearFilters} style={{ flex: 1 }}>Reset</button>
              <button className="btn btn-primary" onClick={handleApplyFilters} style={{ flex: 2 }}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive stylesheet */}
      <style>{`
        @media (max-width: 992px) {
          .desktop-sidebar-filters {
            display: none !important;
          }
        }
        @media (min-width: 993px) {
          .mobile-filter-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
