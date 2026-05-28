import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Truck, Calendar, ShoppingBag, ShieldCheck } from 'lucide-react';

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Order not found</h2>
        <Link to="/shop" className="btn btn-secondary" style={{ marginTop: '20px' }}>Back to Shop</Link>
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
    <div className="container animate-fade-in" style={{ paddingTop: '60px', maxWidth: '800px', minHeight: '80vh' }}>
      
      {/* Thank you Splash banner */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '56px' }}>
        <div style={{ color: '#10b981', display: 'inline-flex', padding: '16px', background: 'rgba(16,185,129,0.08)', borderRadius: '50%' }}>
          <CheckCircle2 size={56} />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'hsl(var(--primary))' }}>Purchase Complete</span>
        <h1 style={{ fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thank you for your order</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '500px', lineHeight: '1.6' }}>
          We have received your payment. An email confirmation has been logged, and your order details have been saved to your account.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        marginBottom: '64px'
      }}>
        
        {/* Box 1: Shipment status timeline */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} style={{ color: 'hsl(var(--primary))' }} /> Delivery Tracking
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '16px' }}>
            
            {/* Timeline Vertical line bar */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '4px',
              bottom: '8px',
              width: '2px',
              backgroundColor: 'rgba(255,255,255,0.08)'
            }}></div>

            {milestones.map((milestone, idx) => {
              const completed = idx <= activeStatusIndex;
              const current = idx === activeStatusIndex;
              
              // Find matching description from trackingLogs
              const logEntry = order.trackingLogs.find(l => l.status === milestone.key || (milestone.key === 'Paid' && l.status === 'Paid'));
              
              return (
                <div key={milestone.label} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  
                  {/* Circle milestone */}
                  <div style={{
                    position: 'absolute',
                    left: '-17px',
                    top: '5px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: completed ? 'hsl(var(--primary))' : '#1f2937',
                    border: current ? '3px solid rgba(212,175,55,0.3)' : 'none',
                    boxShadow: completed ? '0 0 8px hsl(var(--primary))' : 'none',
                    transition: 'all 0.3s'
                  }}></div>

                  <div style={{ paddingLeft: '12px' }}>
                    <h3 style={{
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: completed ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))'
                    }}>{milestone.label}</h3>
                    {completed && logEntry && (
                      <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
                        {logEntry.description} <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>({new Date(logEntry.timestamp).toLocaleTimeString()})</span>
                      </p>
                    )}
                    {current && !logEntry && (
                      <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>In progress...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Box 2: Order Information Summary */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} style={{ color: 'hsl(var(--primary))' }} /> Order Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>
            <div>
              Order ID: <strong style={{ color: 'hsl(var(--text-primary))', fontFamily: 'monospace' }}>#{order._id}</strong>
            </div>
            <div>
              Payment: <strong style={{ color: 'hsl(var(--text-primary))' }}>{order.paymentMethod}</strong>
            </div>
            <div>
              Delivery ETA: <strong style={{ color: 'hsl(var(--primary))', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {etaDate.toDateString()}
              </strong>
            </div>
            <div>
              Shipping To: <br />
              <span style={{ color: 'hsl(var(--text-primary))', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>
                {order.shippingAddress.street}, <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode} <br />
                Phone: {order.shippingAddress.phone}
              </span>
            </div>
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
            <span>Amount Paid</span>
            <span style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-display)' }}>₹{order.totalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* Footer Return button */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <Link to="/shop" className="btn btn-primary" style={{ padding: '14px 32px' }}>Continue Shopping</Link>
      </div>

    </div>
  );
};
