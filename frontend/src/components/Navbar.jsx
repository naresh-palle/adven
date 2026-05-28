import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingBag, Heart, User, LogOut, Menu, X, Search, Shield } from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const handleLogoutClick = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;


  return (
    <nav className="sticky top-0 z-50 h-20 w-full flex items-center bg-bg-color/80 backdrop-blur-md border-b border-border-color/40 shadow-md transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between w-full">
        
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-text-secondary hover:text-primary transition-colors p-2"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl md:text-3xl font-extrabold tracking-widest uppercase gold-text">ADVEN</span>
          </Link>
        </div>

        {/* Center: Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-medium uppercase tracking-wider transition-colors ${isActive('/') ? 'text-primary border-b border-primary pb-1' : 'text-text-secondary hover:text-text-primary'}`}>Home</Link>
          <Link to="/shop" className={`text-sm font-medium uppercase tracking-wider transition-colors ${isActive('/shop') ? 'text-primary border-b border-primary pb-1' : 'text-text-secondary hover:text-text-primary'}`}>Shop</Link>
          {user && (
            <Link to="/wishlist" className={`text-sm font-medium uppercase tracking-wider transition-colors ${isActive('/wishlist') ? 'text-primary border-b border-primary pb-1' : 'text-text-secondary hover:text-text-primary'}`}>Wishlist</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={`text-sm font-medium uppercase tracking-wider transition-colors flex items-center gap-1.5 ${isActive('/admin') ? 'text-primary border-b border-primary pb-1' : 'text-primary/80 hover:text-primary'}`}>
              <Shield size={14} /> Admin
            </Link>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Toggle */}
          <button className="text-text-secondary hover:text-primary transition-colors p-2" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <Search size={20} />
          </button>

          {/* Wishlist Icon */}
          <Link to="/wishlist" className="text-text-secondary hover:text-primary transition-colors relative p-2" aria-label="Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-black font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="text-text-secondary hover:text-primary transition-colors relative p-2" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-black font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </Link>

          {/* Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button 
                className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2 p-2" 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label="Profile dropdown"
              >
                <User size={20} />
                <span className="hidden lg:inline text-sm text-text-secondary">{user.name.split(' ')[0]}</span>
              </button>
              
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card-bg border border-border-color/80 rounded-md py-2 shadow-xl z-50 flex flex-col">
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 text-sm text-primary flex items-center gap-2 hover:bg-white/5 transition-colors">
                      <Shield size={16} /> Admin Portal
                    </Link>
                  )}
                  <button onClick={handleLogoutClick} className="px-4 py-2 text-sm text-danger flex items-center gap-2 hover:bg-white/5 transition-colors w-full text-left">
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-secondary !py-2 !px-4 !text-xs" onClick={onOpenAuth}>
              Login
            </button>
          )}
        </div>

      </div>

      {/* Slide-down Search Input */}
      {searchOpen && (
        <div className="absolute top-20 left-0 w-full bg-card-bg border-b border-border-color p-4 shadow-lg animate-fade-in z-50">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-4xl mx-auto items-center">
            <input 
              type="text" 
              placeholder="Search premium apparel (e.g., silk shirt, trousers)..." 
              className="form-control flex-1 !bg-white/5 !border-border-color/60 focus:!border-primary"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary !py-2.5 !px-6">Search</button>
            <button type="button" className="btn btn-secondary !p-2.5" onClick={() => setSearchOpen(false)}>
              <X size={20} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer (Responsive Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 transition-opacity duration-300 flex" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 bg-bg-color border-r border-border-color/50 h-full p-6 flex flex-col gap-6 shadow-2xl relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex justify-between items-center">
              <span className="font-display text-2xl font-extrabold tracking-widest uppercase gold-text">ADVEN</span>
              <button className="text-text-secondary hover:text-primary transition-colors p-2" onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-5 mt-6">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`text-base font-medium tracking-wider uppercase ${isActive('/') ? 'text-primary' : 'text-text-secondary'}`}>Home</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className={`text-base font-medium tracking-wider uppercase ${isActive('/shop') ? 'text-primary' : 'text-text-secondary'}`}>Shop</Link>
              {user && (
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className={`text-base font-medium tracking-wider uppercase ${isActive('/wishlist') ? 'text-primary' : 'text-text-secondary'}`}>Wishlist</Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium tracking-wider uppercase text-primary flex items-center gap-2">
                  <Shield size={16} /> Admin Panel
                </Link>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-border-color/40">
              {user ? (
                <div className="flex flex-col gap-3">
                  <span className="text-sm text-text-secondary">Signed in as: <strong className="text-text-primary">{user.name}</strong></span>
                  <button className="btn btn-secondary w-full" onClick={handleLogoutClick}>
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary w-full" onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}>
                  Login / Register
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </nav>
  );
};
