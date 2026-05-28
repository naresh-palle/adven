import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#070709',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      padding: '64px 0 24px 0',
      marginTop: '120px',
      color: 'hsl(var(--text-secondary))'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Column 1: Brand details */}
          <div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px'
            }} className="gold-text">ADVEN</span>
            
            <p style={{ fontSize: '0.88rem', lineHeight: '1.7', marginBottom: '20px' }}>
              Adven defines modern premium menswear. Crafted with precision, sourced responsibly, and curated for the contemporary gentleman. We don't make fashion, we build legacies.
            </p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" className="btn-text" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" className="btn-text" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" className="btn-text" aria-label="Twitter"><Twitter size={18} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 style={{
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '20px',
              color: 'hsl(var(--text-primary))'
            }}>Collections</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <Link to="/shop?category=Shirts" style={{ color: 'inherit' }}>Premium Shirts</Link>
              <Link to="/shop?category=T-Shirts" style={{ color: 'inherit' }}>Pima Cotton Tees</Link>
              <Link to="/shop?category=Trousers" style={{ color: 'inherit' }}>Smart Chinos</Link>
              <Link to="/shop?category=Jeans" style={{ color: 'inherit' }}>Selvedge Denim</Link>
              <Link to="/shop?category=Cargos" style={{ color: 'inherit' }}>Utility Cargos</Link>
            </div>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h3 style={{
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '20px',
              color: 'hsl(var(--text-primary))'
            }}>Customer Care</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <a href="#" style={{ color: 'inherit' }}>Shipping & Returns</a>
              <a href="#" style={{ color: 'inherit' }}>Size Guide</a>
              <a href="#" style={{ color: 'inherit' }}>Store Locator</a>
              <a href="#" style={{ color: 'inherit' }}>FAQs</a>
              <a href="#" style={{ color: 'inherit' }}>Terms of Service</a>
            </div>
          </div>

          {/* Column 4: Address / Contact */}
          <div>
            <h3 style={{
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '20px',
              color: 'hsl(var(--text-primary))'
            }}>Contact Us</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
                <span>102, Gold Crest Towers, Bandra Kurla Complex, Mumbai, India - 400051</span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0 }} />
                <span>+91 (22) 5678 4321</span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0 }} />
                <span>support@adven.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.03)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.8rem'
        }}>
          <span>&copy; {new Date().getFullYear()} Adven Store. All rights reserved.</span>
          <span>Designed for the Modern Gentleman.</span>
        </div>
      </div>
    </footer>
  );
};
