import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Truck, Calendar, ShoppingBag } from 'lucide-react';

export const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !token) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="loader"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold uppercase">Order not found</h2>
        <Link to="/shop" className="btn btn-secondary mt-5 inline-block">Back to Shop</Link>
      </div>
    );
  }

  // Delivery ETA: 4 days from order date
  const orderDate = new Date(order.createdAt);
  const etaDate = new Date(orderDate);
  etaDate.setDate(orderDate.getDate() + 4);

  // Tracking milestones status checklist
  const milestones = [
    { label: 'Placed', key: 'Placed' },
    { label: 'Payment Confirmed', key: 'Paid' },
    { label: 'Processing', key: 'Processing' },
    { label: 'Shipped', key: 'Shipped' },
    { label: 'Delivered', key: 'Delivered' }
  ];

  // Helper to determine status index
  const getStatusIndex = (currentStatus) => {
    const statusMap = {
      'Pending': 0,
      'Paid': 1,
      'Processing': 2,
      'Shipped': 3,
      'Delivered': 4
    };
    return statusMap[currentStatus] || 0;
  };

  const activeStatusIndex = getStatusIndex(order.status);

  return (
    <div className="container mx-auto px-4 md:px-6 pt-12 pb-16 max-w-4xl min-h-[80vh] animate-fade-in">
      
      {/* Thank you Splash banner */}
      <div className="text-center flex flex-col items-center gap-4 mb-14">
        <div className="text-[#10b981] inline-flex p-4 bg-[#10b981]/10 rounded-full">
          <CheckCircle2 size={56} />
        </div>
        <span className="text-xs font-semibold text-primary uppercase tracking-[0.25em]">Purchase Complete</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wide text-white">Thank you for your order</h1>
        <p className="text-sm text-text-secondary max-w-lg leading-relaxed font-light mt-1">
          We have received your payment. An email confirmation has been logged, and your order details have been saved to your account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        
        {/* Box 1: Shipment status timeline */}
        <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-md">
          <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
            <Truck size={18} className="text-primary" /> Delivery Tracking
          </h2>

          <div className="flex flex-col gap-6 relative pl-4">
            
            {/* Timeline Vertical line bar */}
            <div className="absolute top-2.5 left-1 bottom-2.5 w-0.5 bg-white/10"></div>

            {milestones.map((milestone, idx) => {
              const completed = idx <= activeStatusIndex;
              const current = idx === activeStatusIndex;
              
              // Find matching description from trackingLogs
              const logEntry = order.trackingLogs.find(l => l.status === milestone.key || (milestone.key === 'Paid' && l.status === 'Paid'));
              
              return (
                <div key={milestone.label} className="flex gap-4 relative">
                  
                  {/* Circle milestone */}
                  <div className={`absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full transition-all ${
                    completed ? 'bg-primary shadow-[0_0_8px_#d4af37]' : 'bg-[#1f2937]'
                  } ${current ? 'ring-4 ring-primary/30' : ''}`}></div>

                  <div className="pl-3 min-w-0">
                    <h3 className={`text-xs md:text-sm font-semibold ${
                      completed ? 'text-text-primary' : 'text-text-muted'
                    }`}>{milestone.label}</h3>
                    {completed && logEntry && (
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed font-light">
                        {logEntry.description} <span className="text-[10px] text-text-muted font-normal">({new Date(logEntry.timestamp).toLocaleTimeString()})</span>
                      </p>
                    )}
                    {current && !logEntry && (
                      <p className="text-xs text-text-secondary mt-1 font-light">In progress...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Box 2: Order Information Summary */}
        <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-md flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" /> Order Details
            </h2>

            <div className="flex flex-col gap-3 text-xs md:text-sm text-text-secondary">
              <div>
                Order ID: <strong className="text-text-primary font-mono select-all">#{order._id}</strong>
              </div>
              <div>
                Payment: <strong className="text-text-primary">{order.paymentMethod}</strong>
              </div>
              <div>
                Delivery ETA: <strong className="text-primary inline-flex items-center gap-1 font-semibold">
                  <Calendar size={13} /> {etaDate.toDateString()}
                </strong>
              </div>
              <div className="leading-relaxed mt-1">
                Shipping To: <br />
                <span className="text-text-primary block mt-1 font-normal">
                  {order.shippingAddress.street}, <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode} <br />
                  Phone: {order.shippingAddress.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <div className="flex justify-between items-center font-bold text-sm md:text-base text-white">
              <span>Amount Paid</span>
              <span className="text-primary font-display">₹{order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Return button */}
      <div className="text-center">
        <Link to="/shop" className="btn btn-primary !py-3.5 !px-8 text-xs sm:text-sm">Continue Shopping</Link>
      </div>

    </div>
  );
};
