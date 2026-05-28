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
      <div className="container mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="inline-flex p-6 bg-white/[0.02] border border-white/5 rounded-full mb-6 text-text-muted">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-extrabold uppercase mb-3">Your Cart is Empty</h2>
        <p className="text-text-secondary mb-8 max-w-sm mx-auto text-sm leading-relaxed font-light">
          Browse our collections of premium shirts, t-shirts, and tailored fit trousers to discover your style.
        </p>
        <Link to="/shop" className="btn btn-primary !py-3.5 !px-8">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 pt-10 pb-16 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide mb-10">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Cart items list */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cartItems.map((item) => (
            <div 
              key={`${item.product}-${item.size}`}
              className="flex flex-col sm:flex-row gap-5 p-5 border border-border-color bg-white/[0.01] rounded-sm items-center relative"
            >
              {/* Product Thumbnail */}
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-20 h-24 object-cover rounded-sm bg-[#0f0f13] shrink-0"
              />

              {/* Item Info details */}
              <div className="flex-1 min-w-0 flex flex-col gap-1 text-left w-full pr-10 sm:pr-0">
                <Link to={`/product/${item.product}`} className="font-semibold text-sm md:text-base text-text-primary hover:text-primary transition-colors truncate">
                  {item.name}
                </Link>
                <div className="text-xs text-text-secondary">
                  Size: <strong className="text-text-primary">{item.size}</strong>
                </div>
                <div className="text-sm font-semibold text-primary mt-0.5">
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Quantity Changer & Pricing Area */}
              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 border-t border-white/5 pt-4 sm:pt-0 sm:border-0">
                {/* Quantity Changer */}
                <div className="flex items-center border border-border-color rounded-sm p-0.5 bg-white/[0.02]">
                  <button 
                    onClick={() => updateQuantity(item.product, item.size, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors font-bold text-sm"
                  >-</button>
                  <span className="w-10 text-center text-xs md:text-sm font-semibold text-text-primary">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product, item.size, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors font-bold text-sm"
                  >+</button>
                </div>

                {/* Total price for item */}
                <div className="text-sm md:text-base font-bold font-display text-text-primary text-right sm:min-w-[100px]">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Delete item button */}
              <button 
                onClick={() => removeFromCart(item.product, item.size)}
                className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto text-text-muted hover:text-danger transition-colors p-1"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          
          {/* Coupon Input */}
          <div className="glass p-5 md:p-6 rounded-sm border border-white/5 shadow-md">
            <h3 className="text-xs md:text-sm font-display font-semibold uppercase tracking-wider text-text-primary mb-4 flex items-center gap-2">
              <Tag size={15} className="text-primary" /> Promo Coupon
            </h3>
            
            {coupon ? (
              <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-3 rounded-sm text-xs">
                <span className="text-primary font-bold">{coupon.code} Applied</span>
                <button onClick={removeCoupon} className="text-danger hover:text-danger-hover transition-colors p-1">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. ADVEN10" 
                  className="form-control flex-1 text-xs py-2 px-3 focus:!border-primary !bg-white/5" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary !py-2 !px-4 !text-xs" disabled={couponLoading}>
                  Apply
                </button>
              </form>
            )}
            
            {couponMsg.text && (
              <div className={`text-[11px] mt-2.5 ${couponMsg.error ? 'text-danger' : 'text-success'}`}>
                {couponMsg.text}
              </div>
            )}
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="glass p-6 rounded-sm border border-white/5 shadow-md">
            <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-primary mb-5">Order Summary</h3>
            
            <div className="flex flex-col gap-4 text-xs md:text-sm text-text-secondary">
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
                <span className="text-text-primary font-medium">
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                </span>
              </div>
              
              <hr className="border-white/5 my-1" />
              
              <div className="flex justify-between items-center text-base md:text-lg font-bold text-primary font-display">
                <span>Total Amount</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="btn btn-primary w-full py-4 mt-6 text-xs md:text-sm flex items-center justify-center gap-2"
            >
              Checkout Now <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
