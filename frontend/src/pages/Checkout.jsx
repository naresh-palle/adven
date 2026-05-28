import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Truck, ArrowLeft, Loader2 } from 'lucide-react';

export const Checkout = () => {
  const { cartItems, totalPrice, subtotal, discountAmount, taxPrice, shippingPrice, coupon, clearCart } = useCart();
  const { user, token } = useAuth();
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

  // Dynamically load Razorpay SDK script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode || !phone) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    setErrorMsg('');
    setPaying(true);
    setPaymentStep(1); // Creating order

    const orderDetails = {
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
      itemsPrice: subtotal,
      taxPrice,
      shippingPrice,
      discountPrice: discountAmount,
      totalPrice,
      couponApplied: coupon ? coupon.code : undefined,
    };

    try {
      // 1. Create Razorpay order ID in backend (this performs dry-run stock check)
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalPrice,
          orderItems: orderDetails.orderItems,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setErrorMsg(orderData.message || 'Inventory allocation or order creation failed.');
        setPaying(false);
        setPaymentStep(0);
        return;
      }

      // Check if sandbox mock mode
      if (orderData.id.startsWith('order_mock_')) {
        console.log('--- ENTERING SANDBOX SIMULATED PAYMENT ---');
        // Simulate payment verification delay
        setTimeout(() => {
          setPaymentStep(2); // Verifying
        }, 1500);

        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: orderData.id,
                razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
                razorpay_signature: 'sig_mock',
                orderData: orderDetails,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              setPaymentStep(3); // Success
              clearCart();
              setTimeout(() => {
                setPaying(false);
                navigate(`/order-success?id=${verifyData._id}`);
              }, 2000);
            } else {
              setErrorMsg(verifyData.message || 'Payment verification failed.');
              setPaying(false);
              setPaymentStep(0);
            }
          } catch (err) {
            setErrorMsg('Network error verifying payment.');
            setPaying(false);
            setPaymentStep(0);
          }
        }, 3500);

        return;
      }

      // 2. Launch actual Razorpay SDK checkout iframe
      setPaying(false); // Hide spinner while Razorpay UI is active
      setPaymentStep(0);

      const rzpOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ADVEN STORE',
        description: 'Luxury Sartorial Purchase',
        order_id: orderData.id,
        handler: async function (response) {
          // Trigger spinner for verification phase
          setPaying(true);
          setPaymentStep(2); // Verifying transaction

          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: orderDetails,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              setPaymentStep(3); // Success
              clearCart();
              setTimeout(() => {
                setPaying(false);
                navigate(`/order-success?id=${verifyData._id}`);
              }, 2000);
            } else {
              setErrorMsg(verifyData.message || 'Signature verification failed.');
              setPaying(false);
              setPaymentStep(0);
            }
          } catch (err) {
            setErrorMsg('Network error verifying payment.');
            setPaying(false);
            setPaymentStep(0);
          }
        },
        prefill: {
          name: user ? user.name : '',
          email: user ? user.email : '',
          contact: phone,
        },
        theme: {
          color: '#d4af37',
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', function (response) {
        setErrorMsg(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      setErrorMsg('Network error establishing secure connection.');
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
