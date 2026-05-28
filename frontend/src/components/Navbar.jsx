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
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 'var(--navbar-height)',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      boxShadow: 'var(--shadow-md)',
      transition: 'background var(--transition-normal)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        {/* Left: Mobile Menu Toggle / Brand Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn-text" 
            style={{ padding: '8px', display: 'none' }} /* Shown in mobile media queries */
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-toggle"
            aria-label="Toggle mobile menu"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }} className="gold-text">ADVEN</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="desktop-links" style={{ display: 'flex', gap: '32px' }}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`}>Shop</Link>
          {user && (
            <Link to="/wishlist" className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}>Wishlist</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} style={{ color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={14} /> Admin
            </Link>
          )}
        </div>

        {/* Right: Actions (Search, Wishlist, Cart, Profile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search Toggle */}
          <button className="btn-text" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <Search size={20} />
          </button>

          {/* Wishlist Link */}
          <Link to="/wishlist" className="btn-text" style={{ position: 'relative' }} aria-label="Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                background: 'hsl(var(--primary))',
                color: '#000',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{wishlist.length}</span>
            )}
          </Link>

          {/* Cart Link */}
          <Link to="/cart" className="btn-text" style={{ position: 'relative' }} aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                background: 'hsl(var(--primary))',
                color: '#000',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{cartCount}</span>
            )}
          </Link>

          {/* User Profile / Auth Action */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                className="btn-text" 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                aria-label="User profile options"
              >
                <User size={20} />
                <span className="desktop-username" style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{user.name.split(' ')[0]}</span>
              </button>
              
              {userDropdownOpen && (
                <div className="glass" style={{
                  position: 'absolute',
                  right: 0,
                  top: '40px',
                  width: '180px',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 0',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserDropdownOpen(false)} style={{
                      padding: '10px 16px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'hsl(var(--primary))'
                    }}>
                      <Shield size={16} /> Admin Portal
                    </Link>
                  )}
                  <button onClick={handleLogoutClick} style={{
                    padding: '10px 16px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'hsl(var(--danger))',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={onOpenAuth} style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* Global Slide-down Search Bar Overlay */}
      {searchOpen && (
        <div className="glass" style={{
          position: 'absolute',
          top: 'var(--navbar-height)',
          left: 0,
          right: 0,
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Search premium men's clothing (e.g. linen shirt, cargos)..." 
              className="form-control"
              style={{ flex: 1 }}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Search</button>
            <button type="button" className="btn btn-secondary" onClick={() => setSearchOpen(false)} style={{ padding: '12px' }}>
              <X size={20} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Slide-out Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 999
        }} onClick={() => setMobileMenuOpen(false)}>
          <div className="glass" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '280px',
            bottom: 0,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: 'var(--shadow-lg)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="gold-text" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.1em' }}>ADVEN</span>
              <button className="btn-text" onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${isActive('/shop') ? 'active' : ''}`}>Shop</Link>
              {user && (
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}>Wishlist</Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={`nav-link ${isActive('/admin') ? 'active' : ''}`} style={{ color: 'hsl(var(--primary))' }}>Admin Portal</Link>
              )}
            </div>

            <div style={{ marginTop: 'auto' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Logged in as: <strong>{user.name}</strong></div>
                  <button className="btn btn-secondary" onClick={handleLogoutClick} style={{ width: '100%' }}>
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }} style={{ width: '100%' }}>
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS overrides inside component to manage responsive states easily */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-links {
            display: none !important;
          }
          #mobile-menu-toggle {
            display: block !important;
          }
          .desktop-username {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};
