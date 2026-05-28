import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';

export const Cart = ({ onOpenAuth }) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    coupon, 
    applyCouponCode, 
    removeCoupon,
    subtotal,
    discountAmount,
    taxPrice,
    shippingPrice,
    totalPrice
  } = useCart();
  
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState({ error: false, text: '' });
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponMsg({ error: false, text: '' });

    const res = await applyCouponCode(couponCode);
    setCouponLoading(false);

    if (res.success) {
      setCouponMsg({ error: false, text: `✓ Coupon applied! Discount: ₹${res.discountAmount}` });
      setCouponCode('');
    } else {
      setCouponMsg({ error: true, text: res.message });
    }
  };

  const handleCheckout = () => {
    if (!token) {
      onOpenAuth();
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div style={{ display: 'inline-flex', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', marginBottom: '24px', color: 'hsl(var(--text-muted))' }}>
          <ShoppingBag size={48} />
        </div>
        <h2 style={{ fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px auto' }}>
          Browse our collections of premium shirts, t-shirts, and tailored fit trousers to discover your style.
        </p>
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px' }}>
      <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', marginBottom: '40px' }}>Your Cart</h1>

      <div className="cart-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '40px',
        alignItems: 'flex-start'
      }}>
        
        {/* Left Column: Cart items list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cartItems.map((item) => (
            <div 
              key={`${item.product}-${item.size}`}
              style={{
                display: 'flex',
                gap: '20px',
                padding: '20px',
                border: '1px solid hsl(var(--border-color))',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {/* Product Thumbnail */}
              <img 
                src={item.image} 
                alt={item.name} 
                style={{
                  width: '80px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#0f0f13'
                }}
              />

              {/* Item Info details */}
              <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Link to={`/product/${item.product}`} style={{ fontWeight: 500, fontSize: '1rem', color: 'hsl(var(--text-primary))' }}>
                  {item.name}
                </Link>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                  Size: <strong style={{ color: 'hsl(var(--text-primary))' }}>{item.size}</strong>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Quantity Changer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid hsl(var(--border-color))',
                borderRadius: 'var(--radius-sm)',
                padding: '2px'
              }}>
                <button 
                  onClick={() => updateQuantity(item.product, item.size, item.quantity - 1)}
                  style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >-</button>
                <span style={{ width: '32px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.product, item.size, item.quantity + 1)}
                  style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
              </div>

              {/* Total price for item */}
              <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>

              {/* Delete item button */}
              <button 
                onClick={() => removeFromCart(item.product, item.size)}
                className="btn-text" 
                style={{ color: 'hsl(var(--text-muted))' }}
                aria-label="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Coupon Input */}
          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} /> Promo Coupon
            </h3>
            
            {coupon ? (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>{coupon.code} Applied</span>
                <button onClick={removeCoupon} style={{ color: 'hsl(var(--danger))' }} className="btn-text">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="e.g. ADVEN10" 
                  className="form-control" 
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={couponLoading}>
                  Apply
                </button>
              </form>
            )}
            
            {couponMsg.text && (
              <div style={{
                fontSize: '0.8rem',
                color: couponMsg.error ? 'hsl(var(--danger))' : 'hsl(var(--success))',
                marginTop: '10px'
              }}>
                {couponMsg.text}
              </div>
            )}
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="glass" style={{ padding: '32px 24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ color: 'hsl(var(--text-primary))' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--success))' }}>
                  <span>Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST Tax (18% GST)</span>
                <span style={{ color: 'hsl(var(--text-primary))' }}>₹{taxPrice.toLocaleString('en-IN')}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping Delivery</span>
                <span style={{ color: 'hsl(var(--text-primary))' }}>
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                </span>
              </div>
              
              <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'hsl(var(--primary))',
                fontFamily: 'var(--font-display)'
              }}>
                <span>Total Amount</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', marginTop: '32px', fontSize: '0.9rem' }}
            >
              Checkout Now <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
