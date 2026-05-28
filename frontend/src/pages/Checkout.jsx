import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Truck, Calendar, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export const Checkout = () => {
  const { cartItems, totalPrice, subtotal, discountAmount, taxPrice, shippingPrice, coupon, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Address inputs
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  
  // Payment state
  const [paying, setPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: Idle, 1: Validating, 2: Processing, 3: Success
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode || !phone) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    setErrorMsg('');
    setPaying(true);
    setPaymentStep(1);

    // Simulate luxury payment flow steps
    setTimeout(() => {
      setPaymentStep(2);
    }, 1500);

    setTimeout(async () => {
      // Create order via backend API
      try {
        const orderData = {
          orderItems: cartItems.map((item) => ({
            product: item.product,
            name: item.name,
            quantity: item.quantity,
            size: item.size,
            price: item.price,
            image: item.image,
          })),
          shippingAddress: {
            street,
            city,
            state,
            postalCode,
            phone,
            country: 'India',
          },
          paymentMethod: 'Simulated Secure Card Payment',
          itemsPrice: subtotal,
          taxPrice,
          shippingPrice,
          discountPrice: discountAmount,
          totalPrice,
          couponApplied: coupon ? coupon.code : undefined,
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        const data = await res.json();

        if (res.ok) {
          setCreatedOrder(data);
          setPaymentStep(3);
          clearCart();
          
          setTimeout(() => {
            setPaying(false);
            navigate(`/order-success?id=${data._id}`);
          }, 2000);
        } else {
          setErrorMsg(data.message || 'Stock allocation or placement failed.');
          setPaying(false);
          setPaymentStep(0);
        }
      } catch (err) {
        setErrorMsg('Network error while placing order.');
        setPaying(false);
        setPaymentStep(0);
      }
    }, 3500);
  };

  if (cartItems.length === 0 && !paying) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>No items in checkout</h2>
        <Link to="/shop" className="btn btn-secondary" style={{ marginTop: '20px' }}>Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', minHeight: '80vh' }}>
      
      {/* Back button */}
      <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text-secondary))', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', marginBottom: '40px' }}>Checkout</h1>

      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'hsl(var(--danger))',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {errorMsg}
        </div>
      )}

      <div className="checkout-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '48px',
        alignItems: 'flex-start'
      }}>
        
        {/* Left Column: Shipping details form */}
        <div className="glass" style={{ padding: '40px 32px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} style={{ color: 'hsl(var(--primary))' }} /> Shipping Destination
          </h2>

          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="street-input">Street Address</label>
              <input 
                type="text" 
                id="street-input"
                placeholder="Flat / House No. / Street Name" 
                className="form-control"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="city-input">City</label>
                <input 
                  type="text" 
                  id="city-input"
                  placeholder="e.g. Mumbai" 
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state-input">State</label>
                <input 
                  type="text" 
                  id="state-input"
                  placeholder="e.g. Maharashtra" 
                  className="form-control"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="pincode-input">PIN Postal Code</label>
                <input 
                  type="text" 
                  id="pincode-input"
                  placeholder="e.g. 400051" 
                  className="form-control"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone-input">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone-input"
                  placeholder="10-digit mobile" 
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Payment banner notice */}
            <div style={{
              display: 'flex',
              gap: '12px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid hsl(var(--border-color))',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              marginTop: '12px',
              alignItems: 'center'
            }}>
              <CreditCard size={20} style={{ color: 'hsl(var(--primary))' }} />
              <div style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                <strong>Secured Sandbox Payment:</strong> Order checkout is completed in secure mock mode. No real cards needed.
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', marginTop: '16px' }}>
              Authorize Payment & Place Order
            </button>
          </form>
        </div>

        {/* Right Column: Order items listing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="glass" style={{ padding: '32px 24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>Items Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              {cartItems.map((item) => (
                <div key={`${item.product}-${item.size}`} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.image} alt="" style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Size: {item.size} x {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.05)', marginBottom: '20px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ color: 'hsl(var(--text-primary))' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: 'hsl(var(--success))' }}>
                  <span>Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <span>GST Tax (18% GST)</span>
                <span style={{ color: 'hsl(var(--text-primary))' }}>₹{taxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <span>Shipping Delivery</span>
                <span style={{ color: 'hsl(var(--text-primary))' }}>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
              </div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
                <span>Grand Total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Simulated Banking Modal Overlay */}
      {paying && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="glass" style={{
            width: '100%',
            maxWidth: '380px',
            borderRadius: 'var(--radius-md)',
            padding: '40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            border: '1px solid rgba(212,175,55,0.2)'
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.1em' }} className="gold-text">ADVEN PAY SECURE</span>

            {paymentStep === 1 && (
              <>
                <Loader2 size={40} className="spin" style={{ color: 'hsl(var(--primary))', animation: 'spin 1.5s linear infinite' }} />
                <h3>Validating credentials</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Connecting with the simulated sandbox authorization portal...</p>
              </>
            )}

            {paymentStep === 2 && (
              <>
                <Loader2 size={40} className="spin" style={{ color: 'hsl(var(--primary))', animation: 'spin 1.5s linear infinite' }} />
                <h3>Processing Transaction</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Debiting ₹{totalPrice.toLocaleString('en-IN')} from your demo account and allocating product inventory...</p>
              </>
            )}

            {paymentStep === 3 && (
              <>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', border: '2px solid #10b981' }}>
                  ✓
                </div>
                <h3 style={{ color: '#10b981' }}>Payment Successful!</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Order Created. Dispatching confirmation email log...</p>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
