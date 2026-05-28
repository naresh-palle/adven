import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const sortSizes = (a, b) => {
  const indexA = sizeOrder.indexOf(a.toUpperCase());
  const indexB = sizeOrder.indexOf(b.toUpperCase());
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  
  const numA = parseInt(a, 10);
  const numB = parseInt(b, 10);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.localeCompare(b);
};

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Supabase stores sizes as plain string array e.g. ['S','M','L']
  const availableSizes = products.length > 0
    ? Array.from(new Set(products.flatMap(p => p.sizes || []))).sort(sortSizes)
    : ['S', 'M', 'L', 'XL', '30', '32', '34', '36'];

  const displayedProducts = activeSize
    ? products.filter(p => (p.sizes || []).includes(activeSize))
    : products;

  // Sync state if URL query parameters change
  useEffect(() => {
    setCategory(activeCategory);
    setMinPrice(activeMinPrice);
    setMaxPrice(activeMaxPrice);
    setSize(activeSize);
    setSortBy(activeSortBy);
  }, [activeCategory, activeSearch, activeMinPrice, activeMaxPrice, activeSize, activeSortBy]);

  // Fetch products from Supabase with client-side filters
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');

        if (activeCategory) query = query.eq('category', activeCategory);
        if (activeSearch) query = query.ilike('name', `%${activeSearch}%`);
        if (activeMinPrice) query = query.gte('price', Number(activeMinPrice));
        if (activeMaxPrice) query = query.lte('price', Number(activeMaxPrice));

        if (activeSortBy === 'price_asc') query = query.order('price', { ascending: true });
        else if (activeSortBy === 'price_desc') query = query.order('price', { ascending: false });
        else if (activeSortBy === 'newest') query = query.order('created_at', { ascending: false });
        else query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (!error && data) setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [activeCategory, activeSearch, activeMinPrice, activeMaxPrice, activeSortBy]);

  // Auto-clear activeSize filter if it is no longer available in the fetched products
  useEffect(() => {
    if (activeSize && products.length > 0 && !loading) {
      const sizes = Array.from(new Set(products.flatMap(p => p.sizes || [])));
      if (!sizes.includes(activeSize)) {
        const newParams = { ...Object.fromEntries(searchParams.entries()) };
        delete newParams.size;
        setSearchParams(newParams);
        setSize('');
      }
    }
  }, [products, activeSize, loading, searchParams, setSearchParams]);

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
    
    const newParams = { ...Object.fromEntries(searchParams.entries()) };
    if (val) {
      newParams.sortBy = val;
    } else {
      delete newParams.sortBy;
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 pt-10 pb-16 min-h-[80vh] animate-fade-in">
      
      {/* Header and Controls summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-color/40 pb-5 mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-white">
            {activeCategory ? activeCategory : 'All Garments'}
          </h1>
          {activeSearch && (
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              Search results for: <strong>"{activeSearch}"</strong>
            </p>
          )}
          <p className="text-xs text-text-muted mt-0.5">
            Showing {displayedProducts.length} products
          </p>
        </div>

        {/* Sort & Mobile filter buttons */}
        <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden btn btn-secondary !py-2.5 !px-4 !text-xs flex items-center gap-2"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 border border-border-color rounded-sm px-3 py-1.5 bg-white/[0.02]">
            <ArrowUpDown size={14} className="text-text-muted" />
            <select 
              value={sortBy} 
              onChange={handleSortChange}
              className="bg-transparent border-none text-xs md:text-sm text-text-secondary cursor-pointer outline-none py-0.5 pr-2"
            >
              <option value="" className="bg-card-bg">Sort By: Featured</option>
              <option value="price-low" className="bg-card-bg">Price: Low to High</option>
              <option value="price-high" className="bg-card-bg">Price: High to Low</option>
              <option value="rating" className="bg-card-bg">Rating: Highest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main layout body */}
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:flex flex-col gap-8 w-64 shrink-0">
          
          {/* Category Filter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary border-b border-white/5 pb-2">Categories</h3>
            <div className="flex flex-col gap-2.5 items-start">
              <button 
                onClick={() => setCategory('')} 
                className={`text-sm text-left transition-colors ${category === '' ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
              >
                All Products
              </button>
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)} 
                  className={`text-sm text-left transition-colors ${category === cat ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary border-b border-white/5 pb-2">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSize(size === sz ? '' : sz)}
                  className={`w-10 h-10 border text-xs rounded-sm transition-all flex items-center justify-center cursor-pointer ${
                    size === sz 
                      ? 'border-primary bg-primary/10 text-primary font-semibold' 
                      : 'border-border-color bg-transparent text-text-secondary hover:border-primary/40 hover:text-text-primary'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary border-b border-white/5 pb-2">Price Range (₹)</h3>
            <div className="flex gap-3 items-center">
              <input 
                type="number" 
                placeholder="Min" 
                className="form-control text-xs py-2 px-3 focus:!border-primary !bg-white/5 max-w-[90px]" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="text-text-muted text-xs">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                className="form-control text-xs py-2 px-3 focus:!border-primary !bg-white/5 max-w-[90px]" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 mt-4">
            <button className="btn btn-primary w-full py-3" onClick={handleApplyFilters}>Apply Filters</button>
            <button className="btn btn-secondary w-full py-3" onClick={handleClearFilters}>Clear Filters</button>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="loader"></div>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-20 px-6 border border-dashed border-border-color rounded-sm max-w-2xl mx-auto flex flex-col items-center gap-3">
              <h3 className="text-base font-semibold text-text-primary uppercase tracking-wider">No garments found</h3>
              <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                We couldn't find any products matching your active filter criteria. Try adjusting your selections.
              </p>
              <button className="btn btn-secondary !py-2.5 !px-5 !text-xs mt-2" onClick={handleClearFilters}>View All Products</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Filter Drawer Overlay (Mobile/Tablet) */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-end" onClick={() => setFilterDrawerOpen(false)}>
          <div 
            className="w-80 bg-bg-color border-l border-border-color/50 h-full p-6 flex flex-col gap-6 shadow-2xl relative animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-base font-display font-semibold uppercase tracking-wider text-white">Filter Garments</h3>
              <button className="text-text-secondary hover:text-primary transition-colors p-1" onClick={() => setFilterDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Filter Forms */}
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 scrollbar-thin">
              
              {/* Category */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setCategory('')}
                    className={`px-3 py-1.5 rounded-sm text-xs border transition-colors ${
                      category === '' ? 'border-primary text-primary bg-primary/10' : 'border-border-color text-text-secondary'
                    }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-sm text-xs border transition-colors ${
                        category === cat ? 'border-primary text-primary bg-primary/10' : 'border-border-color text-text-secondary'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Sizes</h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSize(size === sz ? '' : sz)}
                      className={`w-10 h-10 border text-xs rounded-sm transition-all flex items-center justify-center ${
                        size === sz 
                          ? 'border-primary bg-primary/10 text-primary font-semibold' 
                          : 'border-border-color bg-transparent text-text-secondary'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Price Range (₹)</h4>
                <div className="flex gap-3 items-center">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="form-control text-xs py-2 px-3 focus:!border-primary !bg-white/5 w-24" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-text-muted text-xs">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="form-control text-xs py-2 px-3 focus:!border-primary !bg-white/5 w-24" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button className="btn btn-secondary flex-1 !py-3 !text-xs" onClick={handleClearFilters}>Reset</button>
              <button className="btn btn-primary flex-2 !py-3 !text-xs" onClick={handleApplyFilters}>Apply</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
