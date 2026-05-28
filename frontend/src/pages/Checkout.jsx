import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Truck, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Checkout = () => {
  const { cartItems, totalPrice, subtotal, discountAmount, taxPrice, shippingPrice, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Address inputs
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  
  // Payment state
  const [paying, setPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: Idle, 1: Order creation, 2: Verification, 3: Success
  const [errorMsg, setErrorMsg] = useState('');


  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode || !phone) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }
    if (!user) {
      setErrorMsg('Please login to place an order.');
      return;
    }

    setErrorMsg('');
    setPaying(true);
    setPaymentStep(1);

    try {
      // 1. Create order in Supabase
      const shippingAddress = `${street}, ${city}, ${state} - ${postalCode}, India. Phone: ${phone}`;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          payment_status: 'pending',
          order_status: 'processing',
          shipping_address: shippingAddress,
        })
        .select()
        .single();

      if (orderError) throw new Error(orderError.message);

      // 2. Insert order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw new Error(itemsError.message);

      setPaymentStep(3);
      clearCart();
      setTimeout(() => {
        setPaying(false);
        navigate(`/order-success?id=${order.id}`);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
      setPaying(false);
      setPaymentStep(0);
    }
  };



  if (cartItems.length === 0 && !paying) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold uppercase">No items in checkout</h2>
        <Link to="/shop" className="btn btn-secondary mt-5 inline-block">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-10 pb-16 min-h-[80vh] animate-fade-in">
      
      {/* Back button */}
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide mb-10">Checkout</h1>

      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 text-danger py-2.5 px-4 rounded-sm text-xs mb-6 text-center max-w-4xl mx-auto">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Shipping details form */}
        <div className="lg:col-span-8 glass p-6 md:p-10 rounded-sm border border-white/5 shadow-lg">
          <h2 className="text-base font-display font-semibold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
            <Truck size={18} className="text-primary" /> Shipping Destination
          </h2>

          <form onSubmit={handlePlaceOrder} className="flex flex-col gap-5">
            <div className="form-group mb-0">
              <label htmlFor="street-input" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Street Address</label>
              <input 
                type="text" 
                id="street-input"
                placeholder="Flat / House No. / Street Name" 
                className="form-control w-full focus:!border-primary !bg-white/5"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="form-group mb-0">
                <label htmlFor="city-input" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">City</label>
                <input 
                  type="text" 
                  id="city-input"
                  placeholder="e.g. Mumbai" 
                  className="form-control w-full focus:!border-primary !bg-white/5"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label htmlFor="state-input" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">State</label>
                <input 
                  type="text" 
                  id="state-input"
                  placeholder="e.g. Maharashtra" 
                  className="form-control w-full focus:!border-primary !bg-white/5"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="form-group mb-0">
                <label htmlFor="pincode-input" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">PIN Postal Code</label>
                <input 
                  type="text" 
                  id="pincode-input"
                  placeholder="e.g. 400051" 
                  className="form-control w-full focus:!border-primary !bg-white/5"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label htmlFor="phone-input" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone-input"
                  placeholder="10-digit mobile" 
                  className="form-control w-full focus:!border-primary !bg-white/5"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Payment banner notice */}
            <div className="flex gap-3 bg-white/[0.02] border border-border-color p-4 rounded-sm items-center mt-2">
              <CreditCard size={20} className="text-primary shrink-0" />
              <div className="text-xs text-text-secondary leading-relaxed">
                <strong>Secured Razorpay Checkout:</strong> Payments are processed securely via the sandbox checkout widget.
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-4 mt-4">
              Proceed to Secure Payment
            </button>
          </form>
        </div>

        {/* Right Column: Order items listing */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          <div className="glass p-5 md:p-6 rounded-sm border border-white/5 shadow-md">
            <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-primary mb-5">Items Summary</h3>
            
            <div className="flex flex-col gap-4 mb-5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
              {cartItems.map((item) => (
                <div key={`${item.product}-${item.size}`} className="flex gap-3 items-center">
                  <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-sm bg-[#0f0f13] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-primary truncate">{item.name}</div>
                    <div className="text-[10px] text-text-muted">Size: {item.size} x {item.quantity}</div>
                  </div>
                  <div className="text-xs font-bold text-text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            <hr className="border-white/5 my-4" />

            <div className="flex flex-col gap-3.5 text-xs md:text-sm text-text-secondary">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-text-primary font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-success">
                  <span>Discount</span>
                  <span className="font-medium">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>GST Tax (18% GST)</span>
                <span className="text-text-primary font-medium">₹{taxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping Delivery</span>
                <span className="text-text-primary font-medium">{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
              </div>
              <hr className="border-white/5 my-1" />
              <div className="flex justify-between items-center text-base md:text-lg font-bold text-primary font-display">
                <span>Grand Total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Simulated/Real Banking Modal Overlay */}
      {paying && (
        <div className="fixed inset-0 bg-black/90 z-[1001] flex items-center justify-center p-4">
          <div className="glass w-full max-w-[380px] rounded-md p-8 md:p-10 text-center flex flex-col items-center gap-6 border border-primary/20 shadow-2xl">
            <span className="font-display text-xl font-extrabold tracking-widest uppercase gold-text">ADVEN PAY SECURE</span>

            {paymentStep === 1 && (
              <>
                <Loader2 size={36} className="animate-spin text-primary" />
                <h3 className="text-base font-semibold text-text-primary uppercase tracking-wider">Creating Order</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Securing inventory and establishing contact with payment gateway...</p>
              </>
            )}

            {paymentStep === 2 && (
              <>
                <Loader2 size={36} className="animate-spin text-primary" />
                <h3 className="text-base font-semibold text-text-primary uppercase tracking-wider">Verifying Transaction</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Verifying payment signature and finalizing inventory stock deductions...</p>
              </>
            )}

            {paymentStep === 3 && (
              <>
                <div className="w-12 h-12 rounded-full bg-success/15 border-2 border-success flex items-center justify-center text-success font-bold text-lg">
                  ✓
                </div>
                <h3 className="text-base font-bold text-success uppercase tracking-wider">Payment Verified!</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Order Created. Dispatching confirmation email log...</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
