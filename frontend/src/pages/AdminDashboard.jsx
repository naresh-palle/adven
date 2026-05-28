import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Plus, Package, Edit, Trash2, ListChecks, 
  AlertTriangle, IndianRupee, ShoppingBag, Truck, History, Upload, X 
} from 'lucide-react';

export const AdminDashboard = () => {
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Active Tab: 'analytics', 'products', 'inventory', 'orders', 'logs'
  const [activeTab, setActiveTab] = useState('analytics');

  // Backend loaded states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Form states for creating/editing product
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [editId, setEditId] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Shirts',
    images: [],
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 15 },
      { size: 'XL', stock: 10 }
    ],
    featured: false
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [formMsg, setFormMsg] = useState({ error: false, text: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch admin dashboard details
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch products
      const prodRes = await fetch('/api/products');
      let prodData = [];
      if (prodRes.ok) {
        prodData = await prodRes.json();
        setProducts(prodData);
      }

      // 2. Fetch orders and analytics
      const orderRes = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData.orders);
        setAnalytics(orderData.analytics);
      }

      // 3. Fetch inventory status
      const invRes = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventoryList(invData.inventory);
        setLowStockAlerts(invData.alerts);
      }

      // 4. Fetch inventory logs
      const logRes = await fetch('/api/inventory/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (logRes.ok) {
        const logData = await logRes.json();
        setInventoryLogs(logData);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  // Image Upload helper (Base64 file reader simulation)
  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim()) {
      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()]
      }));
      setImageUrlInput('');
    }
  };

  const removeImageIndex = (idx) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  // Stock Form field update helper
  const handleSizeStockChange = (size, newStock) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => s.size === size ? { ...s, stock: Number(newStock) } : s)
    }));
  };

  // Submit product create/edit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (productForm.images.length === 0) {
      setFormMsg({ error: true, text: 'Please add at least one product image url or file.' });
      return;
    }

    setFormSubmitting(true);
    setFormMsg({ error: false, text: '' });

    try {
      const url = formMode === 'create' ? '/api/products' : `/api/products/${editId}`;
      const method = formMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      const data = await response.json();

      if (response.ok) {
        setFormMsg({ error: false, text: `Product ${formMode === 'create' ? 'created' : 'updated'} successfully!` });
        // Reset form
        setProductForm({
          name: '',
          description: '',
          price: '',
          category: 'Shirts',
          images: [],
          sizes: [
            { size: 'S', stock: 10 },
            { size: 'M', stock: 15 },
            { size: 'L', stock: 15 },
            { size: 'XL', stock: 10 }
          ],
          featured: false
        });
        setFormMode('create');
        setEditId('');
        loadDashboardData();
      } else {
        setFormMsg({ error: true, text: data.message || 'Product submit failed.' });
      }
    } catch (err) {
      setFormMsg({ error: true, text: 'Network connection error.' });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete product action
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This will clear its reviews too.')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load product details into form for edit mode
  const handleEditInit = (prod) => {
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      category: prod.category,
      images: prod.images,
      sizes: prod.sizes,
      featured: prod.featured
    });
    setFormMode('edit');
    setEditId(prod._id);
    setFormMsg({ error: false, text: '' });
    // Scroll form into view
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Inline Quick Stock update
  const handleManualStockUpdate = async (productId, size, currentStock) => {
    const amountStr = window.prompt(`Update stock for Size: ${size}. Enter new stock count:`, currentStock);
    if (amountStr === null || amountStr.trim() === '') return;
    
    const newStock = Number(amountStr);
    if (isNaN(newStock) || newStock < 0) {
      alert('Invalid stock number.');
      return;
    }

    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          size,
          newStock,
          description: `Manual adjustment by admin`
        })
      });

      if (res.ok) {
        loadDashboardData();
      } else {
        const err = await res.json();
        alert(err.message || 'Stock update failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order delivery status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    const desc = window.prompt(`Update order status to: ${newStatus}. Enter tracking message (optional):`, `Order updated to ${newStatus}`);
    if (desc === null) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          description: desc
        })
      });

      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', minHeight: '90vh' }}>
      
      {/* Header title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Administrative Panel</span>
          <h1 style={{ fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adven House Dashboard</h1>
        </div>
      </div>

      {/* Tabs navigation row */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '10px 18px' }}
        >
          <BarChart3 size={14} /> Analytics
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '10px 18px' }}
        >
          <Plus size={14} /> Products Management
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '10px 18px' }}
        >
          <Package size={14} /> Stock Registry
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '10px 18px' }}
        >
          <ListChecks size={14} /> Orders Management
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '10px 18px' }}
        >
          <History size={14} /> Inventory Logs
        </button>
      </div>

      {/* Global Dashboard Loader */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <div>
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && analytics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Stat Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px'
              }}>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--primary))', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Revenue</span>
                    <IndianRupee size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>₹{analytics.totalSales.toLocaleString('en-IN')}</h3>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--text-secondary))', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</span>
                    <ShoppingBag size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>{analytics.totalOrders}</h3>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--warning))', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Processing Orders</span>
                    <Truck size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>{analytics.pendingOrders}</h3>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)', borderColor: lowStockAlerts.length > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: lowStockAlerts.length > 0 ? 'hsl(var(--danger))' : 'hsl(var(--text-secondary))', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Stock Alerts</span>
                    <AlertTriangle size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>{lowStockAlerts.length}</h3>
                </div>
              </div>

              {/* Low Stock Warning Box */}
              {lowStockAlerts.length > 0 && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.1)',
                  padding: '24px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <h3 style={{ fontSize: '1rem', color: 'hsl(var(--danger))', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <AlertTriangle size={16} /> Immediate Stock Replenishment Warnings
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {lowStockAlerts.map((alertItem) => (
                      <div key={alertItem._id} className="glass" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <div>
                          <strong>{alertItem.name}</strong> <br />
                          <span style={{ color: 'hsl(var(--text-muted))' }}>Category: {alertItem.category}</span>
                        </div>
                        <button 
                          onClick={() => { setActiveTab('inventory'); }} 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Restock Sizes
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS FORM AND GRID */}
          {activeTab === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              
              {/* Product Creator/Editor Form */}
              <div className="glass" style={{ padding: '40px 32px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '24px' }}>
                  {formMode === 'create' ? 'Create New Garment' : 'Edit Garment Details'}
                </h2>

                {formMsg.text && (
                  <div style={{
                    backgroundColor: formMsg.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: formMsg.error ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                    color: formMsg.error ? 'hsl(var(--danger))' : 'hsl(var(--success))',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    {formMsg.text}
                  </div>
                )}

                <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Name, Category, Price */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div className="form-group">
                      <label htmlFor="product-name">Product Name</label>
                      <input 
                        type="text" 
                        id="product-name"
                        className="form-control" 
                        placeholder="e.g. Adven Tailored Silk Shirt"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="product-category">Category</label>
                      <select 
                        id="product-category"
                        className="form-control"
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      >
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Shirts">Shirts</option>
                        <option value="Trousers">Trousers</option>
                        <option value="Jeans">Jeans</option>
                        <option value="Cotton Shorts">Cotton Shorts</option>
                        <option value="Cargos">Cargos</option>
                        <option value="Sports Trousers">Sports Trousers</option>
                        <option value="Sports Shorts">Sports Shorts</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-price">Price in INR (₹)</label>
                      <input 
                        type="number" 
                        id="product-price"
                        className="form-control" 
                        placeholder="e.g. 2999"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label htmlFor="product-desc">Garment Description</label>
                    <textarea 
                      id="product-desc"
                      rows="3" 
                      className="form-control" 
                      placeholder="Crafted from premium fabrics..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      required
                    ></textarea>
                  </div>

                  {/* Multiple image uploading */}
                  <div className="form-group">
                    <label>Garment Images (Multiple)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        style={{ flex: 1 }}
                        placeholder="Paste image URL..."
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                      />
                      <button type="button" className="btn btn-secondary" onClick={addImageUrl}>Add URL</button>
                      
                      {/* Base64 file loader */}
                      <label className="btn btn-secondary" style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                        <Upload size={16} /> Upload File
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={handleImageFileChange} 
                        />
                      </label>
                    </div>
                    
                    {/* Images thumbnail list previews */}
                    {productForm.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {productForm.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '60px', height: '75px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                              type="button" 
                              onClick={() => removeImageIndex(idx)}
                              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: 'hsl(var(--danger))', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Size and Stocks Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>Daily Stock Management By Sizes</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
                      {productForm.sizes.map((s) => (
                        <div key={s.size} style={{
                          padding: '12px',
                          border: '1px solid hsl(var(--border-color))',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          backgroundColor: 'rgba(255,255,255,0.01)'
                        }}>
                          <strong style={{ fontSize: '0.9rem' }}>Size: {s.size}</strong>
                          <input 
                            type="number" 
                            className="form-control" 
                            style={{ textAlign: 'center', padding: '6px' }}
                            value={s.stock}
                            onChange={(e) => handleSizeStockChange(s.size, e.target.value)}
                            min="0"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="featured-checkbox" 
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                    />
                    <label htmlFor="featured-checkbox" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Mark product as Featured Essential</label>
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formSubmitting}>
                      {formSubmitting ? 'Submitting...' : (formMode === 'create' ? 'Create Product' : 'Save Changes')}
                    </button>
                    {formMode === 'edit' && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setFormMode('create');
                          setEditId('');
                          setProductForm({
                            name: '',
                            description: '',
                            price: '',
                            category: 'Shirts',
                            images: [],
                            sizes: [
                              { size: 'S', stock: 10 },
                              { size: 'M', stock: 15 },
                              { size: 'L', stock: 15 },
                              { size: 'XL', stock: 10 }
                            ],
                            featured: false
                          });
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                </form>
              </div>

              {/* Product List table view */}
              <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
                <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '24px' }}>Active Catalogue ({products.length} Products)</h3>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--text-muted))' }}>
                      <th style={{ padding: '12px' }}>Garment</th>
                      <th style={{ padding: '12px' }}>Category</th>
                      <th style={{ padding: '12px' }}>Price</th>
                      <th style={{ padding: '12px' }}>Stock sizes</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => {
                      const totalStock = prod.sizes.reduce((acc, curr) => acc + curr.stock, 0);
                      return (
                        <tr key={prod._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <img src={prod.images[0]} alt="" style={{ width: '32px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                            <span>{prod.name}</span>
                          </td>
                          <td style={{ padding: '12px' }}>{prod.category}</td>
                          <td style={{ padding: '12px' }}>₹{prod.price}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontSize: '0.8rem', color: totalStock < 10 ? 'hsl(var(--danger))' : 'hsl(var(--text-secondary))' }}>
                              {totalStock} in stock ({prod.sizes.map(s => `${s.size}:${s.stock}`).join(', ')})
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button onClick={() => handleEditInit(prod)} className="btn-text" style={{ color: 'hsl(var(--primary))' }} title="Edit"><Edit size={16} /></button>
                              <button onClick={() => handleDeleteProduct(prod._id)} className="btn-text" style={{ color: 'hsl(var(--danger))' }} title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: STOCK REGISTRY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '12px' }}>Realtime Stock Allocation Table</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '24px' }}>Click on size buttons to manually adjust individual stock levels. Inventory logs will be compiled automatically.</p>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--text-muted))' }}>
                    <th style={{ padding: '12px' }}>Garment Name</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Size stocks (Adjustable)</th>
                    <th style={{ padding: '12px' }}>Registry Health</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.map((item) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px', fontWeight: 500 }}>{item.name}</td>
                      <td style={{ padding: '12px' }}>{item.category}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {item.sizes.map((s) => (
                            <button
                              key={s.size}
                              onClick={() => handleManualStockUpdate(item._id, s.size, s.stock)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                border: '1px solid',
                                borderColor: s.stock < 5 ? 'hsl(var(--danger))' : 'hsl(var(--border-color))',
                                color: s.stock < 5 ? 'hsl(var(--danger))' : 'hsl(var(--text-secondary))',
                                borderRadius: 'var(--radius-sm)',
                                background: s.stock < 5 ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                                cursor: 'pointer'
                              }}
                              title="Click to edit stock level"
                            >
                              {s.size}: <strong>{s.stock}</strong>
                            </button>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {item.totalStock === 0 ? (
                          <span className="badge badge-danger">Out of stock</span>
                        ) : item.isLowStock ? (
                          <span className="badge badge-danger" style={{ color: 'hsl(var(--warning))', borderColor: 'rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.05)' }}>Low Stock</span>
                        ) : (
                          <span className="badge badge-success">Healthy</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '24px' }}>Active Orders Portal ({orders.length} Orders)</h3>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--text-muted))' }}>
                    <th style={{ padding: '12px' }}>Order ID</th>
                    <th style={{ padding: '12px' }}>Customer Details</th>
                    <th style={{ padding: '12px' }}>Bill Amount</th>
                    <th style={{ padding: '12px' }}>Shipping Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Modify Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>#{ord._id}</td>
                      <td style={{ padding: '12px' }}>
                        <strong>{ord.user ? ord.user.name : 'Verified Customer'}</strong> <br />
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{ord.user ? ord.user.email : ''}</span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>₹{ord.totalPrice.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${
                          ord.status === 'Delivered' ? 'badge-success' 
                          : ord.status === 'Cancelled' ? 'badge-danger'
                          : 'badge-gold'
                        }`}>{ord.status}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <select
                          value={ord.status}
                          onChange={(e) => handleOrderStatusUpdate(ord._id, e.target.value)}
                          style={{
                            background: '#121216',
                            border: '1px solid hsl(var(--border-color))',
                            color: 'hsl(var(--text-secondary))',
                            fontSize: '0.8rem',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Paid">Paid (Placed)</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: INVENTORY LOGS */}
          {activeTab === 'logs' && (
            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '24px' }}>Automated Stock Change Registry</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                {inventoryLogs.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                    No stock modifications logged yet in the database.
                  </div>
                ) : (
                  inventoryLogs.map((log) => {
                    const isReduction = log.changeType === 'sale' || log.changeType === 'manual-reduce';
                    return (
                      <div 
                        key={log._id} 
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '16px',
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          alignItems: 'center',
                          fontSize: '0.88rem'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span>
                            <strong>{log.productName}</strong> (Size: {log.size})
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>
                            {log.description} | Action by: {log.performedBy}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ 
                            fontWeight: 600, 
                            color: isReduction ? 'hsl(var(--danger))' : 'hsl(var(--success))' 
                          }}>
                            {isReduction ? '-' : '+'}{log.quantity} units
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
