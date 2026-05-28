import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#070709] border-t border-white/5 py-16 mt-32 text-text-secondary">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Foot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand details */}
          <div className="flex flex-col gap-4">
            <span className="font-display text-3xl font-extrabold tracking-widest uppercase gold-text block">
              ADVEN
            </span>
            <p className="text-sm leading-relaxed text-text-secondary/90">
              Adven defines modern premium menswear. Crafted with precision, sourced responsibly, and curated for the contemporary gentleman. We don't make fashion, we build legacies.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="text-text-secondary hover:text-primary transition-colors" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors" aria-label="Twitter"><Twitter size={18} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-text-primary mb-5">
              Collections
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <Link to="/shop?category=Shirts" className="hover:text-primary transition-colors">Premium Shirts</Link>
              <Link to="/shop?category=T-Shirts" className="hover:text-primary transition-colors">Pima Cotton Tees</Link>
              <Link to="/shop?category=Trousers" className="hover:text-primary transition-colors">Smart Chinos</Link>
              <Link to="/shop?category=Jeans" className="hover:text-primary transition-colors">Selvedge Denim</Link>
              <Link to="/shop?category=Cargos" className="hover:text-primary transition-colors">Utility Cargos</Link>
            </div>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-text-primary mb-5">
              Customer Care
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <a href="#" className="hover:text-primary transition-colors">Shipping & Returns</a>
              <a href="#" className="hover:text-primary transition-colors">Size Guide</a>
              <a href="#" className="hover:text-primary transition-colors">Store Locator</a>
              <a href="#" className="hover:text-primary transition-colors">FAQs</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>

          {/* Column 4: Address / Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-text-primary mb-5">
              Contact Us
            </h3>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex gap-3 items-start">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">Adven Fashions, Siricilla, Telangana - 505301</span>
              </div>
              <div className="flex gap-3 items-center">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+91 (22) 5678 4321</span>
              </div>
              <div className="flex gap-3 items-center">
                <Mail size={18} className="text-primary shrink-0" />
                <span>support@adven.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Divider & Copyright */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <span>&copy; {new Date().getFullYear()} Adven Store. All rights reserved.</span>
          <span>Designed for the Modern Gentleman.</span>
        </div>

      </div>
    </footer>
  );
};
