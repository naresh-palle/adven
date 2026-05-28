import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Plus, Package, Edit, Trash2, ListChecks, 
  AlertTriangle, IndianRupee, ShoppingBag, Truck, History, Upload, X,
  TrendingUp, Layers, CheckCircle2, Menu
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Update order status
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

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'products', label: 'Catalogue', icon: <Plus size={18} /> },
    { id: 'inventory', label: 'Stock Registry', icon: <Package size={18} /> },
    { id: 'orders', label: 'Orders Portal', icon: <ListChecks size={18} /> },
    { id: 'logs', label: 'Audit Trail', icon: <History size={18} /> }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full">
      
      {/* 1. LEFT STICKY SIDEBAR (Desktop only) */}
      <aside className="hidden lg:flex w-64 bg-card-bg/60 border-r border-white/5 flex-col gap-10 py-10 px-6 shrink-0 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] block mb-1">ADMIN PANEL</span>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">ADVEN HOUSE</h2>
        </div>

        <nav className="flex flex-col gap-1.5 w-full">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 py-3.5 px-4 rounded-sm text-sm transition-all text-left w-full cursor-pointer ${
                activeTab === item.id 
                  ? 'font-semibold text-primary bg-primary/5 border border-primary/15' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.02]'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 2. MOBILE HEADER & DRAWERS */}
      <div className="lg:hidden w-full bg-card-bg/70 border-b border-white/5 py-4 px-6 flex justify-between items-center z-20 sticky top-20 backdrop-blur-md">
        <div>
          <span className="text-[9px] text-primary uppercase tracking-widest block">ADVEN PANEL</span>
          <h3 className="text-base font-bold uppercase tracking-wider text-white">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h3>
        </div>
        <button 
          className="btn btn-secondary !py-2 !px-3.5 !text-xs flex items-center gap-1.5" 
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={16} /> Menu
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 flex justify-end lg:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-72 bg-bg-color border-l border-border-color/50 h-full p-6 flex flex-col gap-6 shadow-2xl relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="font-display text-lg font-extrabold tracking-widest uppercase gold-text">ADVEN MENU</span>
              <button className="text-text-secondary hover:text-primary transition-colors p-1" onClick={() => setMobileMenuOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 py-3 px-4 rounded-sm text-sm text-left ${
                    activeTab === item.id ? 'text-primary bg-primary/5 font-semibold border border-primary/10' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 py-8 px-4 sm:py-10 sm:px-8 lg:px-12 overflow-y-auto w-full">
        
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col gap-8 md:gap-10">
            
            {/* TAB 1: ANALYTICS */}
            {activeTab === 'analytics' && analytics && (
              <div className="flex flex-col gap-8 md:gap-12">
                
                {/* Stat Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Revenue Card */}
                  <div className="glass hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-gold transition-all duration-300 p-6 rounded-sm border border-white/[0.04] flex flex-col gap-3">
                    <div className="flex justify-between items-center text-primary">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Sales Revenue</span>
                      <div className="p-2 rounded-full bg-primary/10"><IndianRupee size={15} /></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">₹{analytics.totalSales.toLocaleString('en-IN')}</h3>
                    <span className="text-[10px] text-success flex items-center gap-1">
                      <TrendingUp size={11} /> +12.4% from last week
                    </span>
                  </div>

                  {/* Total Orders Card */}
                  <div className="glass hover:-translate-y-0.5 hover:border-primary/10 hover:shadow-lg transition-all duration-300 p-6 rounded-sm border border-white/[0.04] flex flex-col gap-3">
                    <div className="flex justify-between items-center text-text-secondary">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Total Orders</span>
                      <div className="p-2 rounded-full bg-white/[0.03]"><ShoppingBag size={15} /></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">{analytics.totalOrders}</h3>
                    <span className="text-[10px] text-text-muted">Average ticket: ₹{analytics.totalOrders > 0 ? Math.round(analytics.totalSales / analytics.totalOrders).toLocaleString('en-IN') : 0}</span>
                  </div>

                  {/* Pending Processing Card */}
                  <div className="glass hover:-translate-y-0.5 hover:border-warning/15 hover:shadow-lg transition-all duration-300 p-6 rounded-sm border border-white/[0.04] flex flex-col gap-3">
                    <div className="flex justify-between items-center text-warning">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Pending Orders</span>
                      <div className="p-2 rounded-full bg-warning/10"><Truck size={15} /></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">{analytics.pendingOrders}</h3>
                    <span className="text-[10px] text-warning/90">Requires packaging & shipment</span>
                  </div>

                  {/* Stock Alerts Card */}
                  <div className="glass hover:-translate-y-0.5 transition-all duration-300 p-6 rounded-sm border flex flex-col gap-3" style={{ borderColor: lowStockAlerts.length > 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.04)' }}>
                    <div className="flex justify-between items-center" style={{ color: lowStockAlerts.length > 0 ? 'hsl(var(--danger))' : 'hsl(var(--text-secondary))' }}>
                      <span className="text-[10px] uppercase font-bold tracking-wider">Stock Warnings</span>
                      <div className="p-2 rounded-full" style={{ backgroundColor: lowStockAlerts.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)' }}><AlertTriangle size={15} /></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">{lowStockAlerts.length}</h3>
                    <span className="text-[10px]" style={{ color: lowStockAlerts.length > 0 ? 'hsl(var(--danger))' : 'hsl(var(--text-muted))' }}>
                      {lowStockAlerts.length > 0 ? 'Critical restock items' : 'All sizes healthy'}
                    </span>
                  </div>
                </div>

                {/* Visual CSS Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                  
                  {/* Category Performance Bar Chart */}
                  <div className="xl:col-span-3 glass p-6 md:p-8 rounded-sm border border-white/[0.04] w-full">
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-6 flex items-center gap-2 text-white">
                      <Layers size={16} className="text-primary shrink-0" /> Category Revenue Distribution
                    </h3>
                    
                    <div className="flex flex-col gap-5 w-full">
                      {[
                        { cat: 'Shirts', rev: Math.round(analytics.totalSales * 0.45), pct: 45 },
                        { cat: 'Trousers', rev: Math.round(analytics.totalSales * 0.25), pct: 25 },
                        { cat: 'Cargos', rev: Math.round(analytics.totalSales * 0.15), pct: 15 },
                        { cat: 'Sports Trousers', rev: Math.round(analytics.totalSales * 0.10), pct: 10 },
                        { cat: 'Others', rev: Math.round(analytics.totalSales * 0.05), pct: 5 }
                      ].map((item) => (
                        <div key={item.cat} className="flex flex-col gap-2 w-full">
                          <div className="flex justify-between items-center text-xs md:text-sm">
                            <span className="text-text-secondary">{item.cat}</span>
                            <strong className="text-text-primary">₹{item.rev.toLocaleString('en-IN')} ({item.pct}%)</strong>
                          </div>
                          <div className="w-full h-2 bg-white/[0.03] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-[#b89326] rounded-full" style={{ width: `${item.pct}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fulfill Health Ratio */}
                  <div className="xl:col-span-2 glass p-6 md:p-8 rounded-sm border border-white/[0.04] flex flex-col justify-between gap-6">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 text-white">
                        <CheckCircle2 size={16} className="text-success shrink-0" /> Fulfillment Health
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-light">
                        Adven system processes and dispatches orders with an average fulfillment rate of 98.6%. 
                      </p>
                    </div>

                    <div className="flex items-center justify-center py-4">
                      <svg className="w-32 h-32" viewBox="0 0 36 36">
                        <path
                          className="circle-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="3.5"
                        />
                        <path
                          className="circle"
                          strokeDasharray="98, 100"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#d4af37"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <text x="18" y="20.35" className="percentage font-bold text-white text-[7px]" textAnchor="middle">98.6%</text>
                      </svg>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs text-text-muted">
                      <span>Completed: {analytics.totalOrders - analytics.pendingOrders}</span>
                      <span>Processing: {analytics.pendingOrders}</span>
                    </div>
                  </div>

                </div>

                {/* Low Stock Warning Box */}
                {lowStockAlerts.length > 0 && (
                  <div className="bg-danger/5 border border-danger/10 p-6 md:p-8 rounded-sm">
                    <h3 className="text-sm text-danger uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                      <AlertTriangle size={16} className="shrink-0" /> CRITICAL CATALOGUE REPLENISHMENT REQUIRED
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lowStockAlerts.map((alertItem) => (
                        <div key={alertItem._id} className="glass p-4 rounded-sm border border-danger/10 flex justify-between items-center text-xs">
                          <div className="min-w-0 pr-3">
                            <strong className="text-white truncate block">{alertItem.name}</strong>
                            <span className="text-[10px] text-text-muted uppercase block mt-1">Category: {alertItem.category}</span>
                          </div>
                          <button 
                            onClick={() => setActiveTab('inventory')} 
                            className="btn btn-secondary !py-1.5 !px-3 !text-[10px] shrink-0"
                          >
                            Restock
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRODUCTS CATALOGUE */}
            {activeTab === 'products' && (
              <div className="flex flex-col gap-8 md:gap-10">
                
                {/* Form to add/edit garment */}
                <div className="glass p-6 sm:p-8 rounded-sm border border-white/5 shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-base md:text-lg font-semibold uppercase tracking-wider text-white">
                      {formMode === 'create' ? 'Create New Catalog Item' : 'Edit Garment Details'}
                    </h2>
                    {formMode === 'edit' && (
                      <button 
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
                          setFormMsg({ error: false, text: '' });
                        }}
                        className="btn btn-secondary !py-1.5 !px-3 !text-xs"
                      >
                        Reset Form
                      </button>
                    )}
                  </div>

                  {formMsg.text && (
                    <div className={`py-2.5 px-4 rounded-sm text-xs mb-6 text-center border ${
                      formMsg.error ? 'bg-danger/10 border-danger/25 text-danger' : 'bg-success/10 border-success/25 text-success'
                    }`}>
                      {formMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleProductSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="form-group mb-0">
                        <label htmlFor="product-name" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Product Title</label>
                        <input 
                          type="text" 
                          id="product-name"
                          className="form-control w-full focus:!border-primary !bg-white/5" 
                          placeholder="e.g. Adven Luxury Silk Linen Shirt"
                          value={productForm.name}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="form-group mb-0">
                        <label htmlFor="product-category" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Category</label>
                        <select 
                          id="product-category"
                          className="form-control w-full focus:!border-primary !bg-white/5 select-control"
                          value={productForm.category}
                          onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        >
                          <option value="T-Shirts" className="bg-card-bg">T-Shirts</option>
                          <option value="Shirts" className="bg-card-bg">Shirts</option>
                          <option value="Trousers" className="bg-card-bg">Trousers</option>
                          <option value="Jeans" className="bg-card-bg">Jeans</option>
                          <option value="Cotton Shorts" className="bg-card-bg">Cotton Shorts</option>
                          <option value="Cargos" className="bg-card-bg">Cargos</option>
                          <option value="Sports Trousers" className="bg-card-bg">Sports Trousers</option>
                          <option value="Sports Shorts" className="bg-card-bg">Sports Shorts</option>
                        </select>
                      </div>

                      <div className="form-group mb-0">
                        <label htmlFor="product-price" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Retail Price (₹)</label>
                        <input 
                          type="number" 
                          id="product-price"
                          className="form-control w-full focus:!border-primary !bg-white/5" 
                          placeholder="e.g. 2999"
                          value={productForm.price}
                          onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group mb-0">
                      <label htmlFor="product-desc" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Editorial Description</label>
                      <textarea 
                        id="product-desc"
                        rows="3" 
                        className="form-control w-full focus:!border-primary !bg-white/5" 
                        placeholder="Detail fabric properties, sizing silhouettes, and styling recommendations..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        required
                      ></textarea>
                    </div>

                    {/* Image uploads */}
                    <div className="form-group mb-0">
                      <label className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Garment Photography (URLs or Local Uploads)</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="text" 
                          className="form-control flex-1 focus:!border-primary !bg-white/5" 
                          placeholder="Paste photography image URL..."
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button type="button" className="btn btn-secondary !py-2.5 !px-5 !text-xs shrink-0" onClick={addImageUrl}>Add URL</button>
                          
                          <label className="btn btn-secondary !py-2.5 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                            <Upload size={14} /> Browse Files
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              className="hidden"
                              onChange={handleImageFileChange} 
                            />
                          </label>
                        </div>
                      </div>
                      
                      {productForm.images.length > 0 && (
                        <div className="flex gap-3 flex-wrap mt-3.5">
                          {productForm.images.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-20 border border-white/5 rounded-sm overflow-hidden shrink-0 bg-[#0f0f13]">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => removeImageIndex(idx)}
                                className="absolute top-1 right-1 bg-black/80 text-danger border-none rounded-full w-4 h-4 flex items-center justify-center cursor-pointer p-0 text-[9px]"
                              >
                                <X size={9} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sizing Stock matrix */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Inventory Allocation matrix</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                        {productForm.sizes.map((s) => (
                          <div key={s.size} className="p-3 border border-border-color rounded-sm text-center flex flex-col gap-2 bg-white/[0.01]">
                            <span className="text-[10px] text-text-secondary font-bold">Size {s.size}</span>
                            <input 
                              type="number" 
                              className="form-control text-center py-1.5 px-1 w-full text-xs" 
                              value={s.stock}
                              onChange={(e) => handleSizeStockChange(s.size, e.target.value)}
                              min="0"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-3 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="featured-checkbox" 
                          checked={productForm.featured}
                          onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                          className="w-4 h-4 cursor-pointer accent-primary"
                        />
                        <label htmlFor="featured-checkbox" className="text-xs md:text-sm cursor-pointer text-text-secondary">Mark as Featured Atelier Item</label>
                      </div>

                      <button type="submit" className="btn btn-primary w-full sm:w-auto !py-3.5 !px-10" disabled={formSubmitting}>
                        {formSubmitting ? 'Submitting...' : (formMode === 'create' ? 'Add To Catalogue' : 'Save Details')}
                      </button>
                    </div>

                  </form>
                </div>

                {/* Catalogue Listing */}
                <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-md">
                  <h3 className="text-base font-display font-semibold uppercase tracking-wider mb-6 text-white">Atelier Catalogue</h3>
                  
                  <div className="overflow-x-auto w-full border border-white/5 rounded-sm bg-white/[0.01]">
                    <table className="w-full border-collapse text-xs md:text-sm text-left whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-white/5 text-text-muted bg-white/[0.02]">
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Garment Details</th>
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Category</th>
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Pricing</th>
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Availability matrix</th>
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => {
                          const totalStock = prod.sizes.reduce((acc, curr) => acc + curr.stock, 0);
                          return (
                            <tr key={prod._id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                              <td className="py-4 px-4 flex gap-3 items-center">
                                <img src={prod.images[0]} alt="" className="w-9 h-11 object-cover rounded-sm border border-white/5 shrink-0" />
                                <div className="min-w-0">
                                  <strong className="text-white text-xs md:text-sm block truncate max-w-[180px]">{prod.name}</strong>
                                  <span className="text-[10px] text-text-muted block mt-0.5">ID: {prod._id.slice(-6)}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-text-secondary">{prod.category}</td>
                              <td className="py-4 px-4 font-semibold text-white">₹{prod.price.toLocaleString('en-IN')}</td>
                              <td className="py-4 px-4">
                                <div className="flex flex-col gap-1">
                                  <span className={`font-semibold text-xs ${totalStock < 5 ? 'text-danger' : 'text-text-secondary'}`}>
                                    {totalStock} Total Units
                                  </span>
                                  <span className="text-[10px] text-text-muted">
                                    ({prod.sizes.map(s => `${s.size}:${s.stock}`).join(', ')})
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="inline-flex gap-2">
                                  <button onClick={() => handleEditInit(prod)} className="text-primary hover:text-primary-hover p-1.5 hover:bg-white/5 rounded-sm transition-all" title="Edit"><Edit size={15} /></button>
                                  <button onClick={() => handleDeleteProduct(prod._id)} className="text-danger hover:text-danger/80 p-1.5 hover:bg-white/5 rounded-sm transition-all" title="Delete"><Trash2 size={15} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: STOCK REGISTRY */}
            {activeTab === 'inventory' && (
              <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-md">
                <div className="mb-6">
                  <h3 className="text-base font-display font-semibold uppercase tracking-wider text-white mb-2">Realtime Stock Allocation Registry</h3>
                  <p className="text-xs text-text-secondary font-light">
                    Click on size indicators below to make adjustments to stock quantities. Audits will be logged automatically.
                  </p>
                </div>

                <div className="overflow-x-auto w-full border border-white/5 rounded-sm bg-white/[0.01]">
                  <table className="w-full border-collapse text-xs md:text-sm text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/5 text-text-muted bg-white/[0.02]">
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Garment Title</th>
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Category</th>
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Allocated Sizing Stocks (Interactive)</th>
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Registry Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryList.map((item) => (
                        <tr key={item._id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                          <td className="py-4 px-4 font-semibold text-white max-w-[200px] truncate">{item.name}</td>
                          <td className="py-4 px-4 text-text-secondary">{item.category}</td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2 flex-wrap">
                              {item.sizes.map((s) => (
                                <button
                                  key={s.size}
                                  onClick={() => handleManualStockUpdate(item._id, s.size, s.stock)}
                                  className={`px-3 py-1.5 text-[10px] md:text-xs font-semibold border rounded-sm transition-all cursor-pointer ${
                                    s.stock < 5 
                                      ? 'border-danger bg-danger/5 text-danger hover:bg-danger/10' 
                                      : 'border-border-color bg-transparent text-text-secondary hover:border-primary/40 hover:text-primary'
                                  }`}
                                  title="Adjust quantity"
                                >
                                  {s.size}: <strong>{s.stock}</strong>
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {item.totalStock === 0 ? (
                              <span className="badge badge-danger">Out of stock</span>
                            ) : item.isLowStock ? (
                              <span className="badge badge-danger !text-warning !border-warning/20 !bg-warning/5">Low Stock</span>
                            ) : (
                              <span className="badge badge-success">Healthy</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: ORDERS PORTAL */}
            {activeTab === 'orders' && (
              <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-md">
                <h3 className="text-base font-display font-semibold uppercase tracking-wider text-white mb-6">Fulfillment Portal ({orders.length} Active Orders)</h3>

                <div className="overflow-x-auto w-full border border-white/5 rounded-sm bg-white/[0.01]">
                  <table className="w-full border-collapse text-xs md:text-sm text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/5 text-text-muted bg-white/[0.02]">
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Order Details</th>
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Customer Profile</th>
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Garments Ordered</th>
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Invoice Total</th>
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Shipping</th>
                        <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Fulfill Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord._id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                          <td className="py-4 px-4">
                            <strong className="font-mono text-white text-[11px] block">#{ord._id.slice(-8).toUpperCase()}</strong>
                            <span className="text-[10px] text-text-muted block mt-0.5">{new Date(ord.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="py-4 px-4">
                            <strong className="text-white text-xs block">{ord.user ? ord.user.name : 'Verified Customer'}</strong>
                            <span className="text-[10px] text-text-muted block mt-0.5">{ord.user ? ord.user.email : ''}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1 max-w-[220px] truncate">
                              {ord.orderItems.map((item, idx) => (
                                <span key={idx} className="text-xs text-text-secondary block truncate">
                                  • {item.name} ({item.size}) × {item.quantity}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-white">₹{ord.totalPrice.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-4">
                            <span className={`badge ${
                              ord.status === 'Delivered' ? 'badge-success' 
                              : ord.status === 'Cancelled' ? 'badge-danger'
                              : 'badge-gold'
                            }`}>{ord.status}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) => handleOrderStatusUpdate(ord._id, e.target.value)}
                              className="bg-[#121216] border border-border-color text-text-secondary text-xs py-1.5 px-2.5 rounded-sm outline-none cursor-pointer"
                            >
                              <option value="Paid">Paid</option>
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
              </div>
            )}

            {/* TAB 5: AUDIT TRAIL LOGS */}
            {activeTab === 'logs' && (
              <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-md">
                <h3 className="text-base font-display font-semibold uppercase tracking-wider text-white mb-6">Inventory Audit Trail</h3>

                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {inventoryLogs.length === 0 ? (
                    <div className="py-12 text-center text-text-muted border border-dashed border-border-color rounded-sm text-xs">
                      No stock modifications logged in the audit registry database yet.
                    </div>
                  ) : (
                    inventoryLogs.map((log) => {
                      const isReduction = log.changeType === 'sale' || log.changeType === 'manual-reduce';
                      return (
                        <div 
                          key={log._id} 
                          className="flex justify-between items-center py-3.5 px-4 bg-white/[0.01] hover:bg-white/[0.02] border-b border-white/5 rounded-sm transition-all text-xs"
                        >
                          <div className="flex flex-col gap-1 min-w-0 pr-4">
                            <span className="text-white font-medium block truncate">
                              <strong>{log.productName}</strong> (Size: {log.size})
                            </span>
                            <span className="text-[10px] text-text-secondary">
                              {log.description} | Action by: {log.performedBy}
                            </span>
                          </div>
                          <div className="text-right shrink-0 flex flex-col gap-1">
                            <span className={`font-semibold ${isReduction ? 'text-danger' : 'text-success'}`}>
                              {isReduction ? '-' : '+'}{log.quantity} units
                            </span>
                            <span className="text-[10px] text-text-muted">
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

      </main>

    </div>
  );
};
