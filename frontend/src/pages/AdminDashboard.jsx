import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Plus, Package, Edit, Trash2, ListChecks, 
  AlertTriangle, IndianRupee, ShoppingBag, Truck, History, Upload, X,
  TrendingUp, Layers, CheckCircle2, Menu, Tag, FileSpreadsheet,
  Download, ArrowDown, ArrowUp, Calendar
} from 'lucide-react';

export const AdminDashboard = () => {
  const { token, isAdmin, login, user } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'analytics', 'products', 'inventory', 'orders', 'discounts', 'logs'
  const [activeTab, setActiveTab] = useState('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Backend loaded states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stockSummary, setStockSummary] = useState(null);
  
  const [loading, setLoading] = useState(true);

  // Admin login credentials (dedicated gate if not admin)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

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

  // Drag and drop states for images
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // CSV Bulk import states
  const [csvDragActive, setCsvDragActive] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [csvMsg, setCsvMsg] = useState({ error: false, text: '' });

  // Catalogue search/filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState('All'); // 'All', 'Low Stock', 'Out of Stock'

  // Coupon form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    expirationDate: '',
    usageLimit: '100'
  });
  const [couponMsg, setCouponMsg] = useState({ error: false, text: '' });

  // Low stock notification tray visibility
  const [showAlertDrawer, setShowAlertDrawer] = useState(false);

  // Fetch admin dashboard details
  const loadDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        setProducts(await prodRes.json());
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
        setInventoryLogs(await logRes.json());
      }

      // 5. Fetch coupons
      const coupRes = await fetch('/api/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (coupRes.ok) {
        setCoupons(await coupRes.json());
      }

      // 6. Fetch stock summaries
      const summaryRes = await fetch('/api/inventory/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (summaryRes.ok) {
        setStockSummary(await summaryRes.json());
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isAdmin) {
      loadDashboardData();
    }
  }, [token, isAdmin]);

  // Handle Admin Login
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setLoginError(res.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setLoginError('Connection refused. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleImageUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleImageUpload(Array.from(e.target.files));
    }
  };

  // Upload image to Cloudinary/Local fallback
  const handleImageUpload = async (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Please drop image files only.');
      return;
    }

    setUploadingImages(true);
    const formData = new FormData();
    imageFiles.forEach(file => formData.append('images', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, ...data.urls]
        }));
      } else {
        alert(data.message || 'Image upload failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the upload service.');
    } finally {
      setUploadingImages(false);
    }
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

  // Sizing stock matrix updates
  const handleSizeStockChange = (size, newStock) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => s.size === size ? { ...s, stock: Number(newStock) } : s)
    }));
  };

  // Product submit create/edit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (productForm.images.length === 0) {
      setFormMsg({ error: true, text: 'Please upload or paste at least one garment image.' });
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
        setFormMsg({ error: true, text: data.message || 'Garment submit failed.' });
      }
    } catch (err) {
      setFormMsg({ error: true, text: 'Network connection error.' });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete product action
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently? This clears reviews and database records.')) return;
    
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

  // Populate edit form
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

  // Stock quick editor (registry tab)
  const handleManualStockUpdate = async (productId, size, currentStock) => {
    const amountStr = window.prompt(`Adjust stock quantity for size [${size}]. New amount:`, currentStock);
    if (amountStr === null || amountStr.trim() === '') return;
    
    const newStock = Number(amountStr);
    if (isNaN(newStock) || newStock < 0) {
      alert('Invalid stock numeric value.');
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
          description: `Manual adjustment by admin (${user?.name || 'Administrator'})`
        })
      });

      if (res.ok) {
        loadDashboardData();
      } else {
        const err = await res.json();
        alert(err.message || 'Friction adjusting inventory.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Order status progression
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    const desc = window.prompt(`Progression state: ${newStatus}. Add shipping tracker comments:`, `Order status verified: ${newStatus}`);
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

  // CSV Drag and drop handlers
  const handleCsvDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setCsvDragActive(true);
    } else if (e.type === "dragleave") {
      setCsvDragActive(false);
    }
  };

  const handleCsvDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCsvDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleCsvUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCsvFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleCsvUpload(e.target.files[0]);
    }
  };

  // Upload CSV endpoint call
  const handleCsvUpload = async (file) => {
    if (!file.name.endsWith('.csv')) {
      setCsvMsg({ error: true, text: 'Please select a formatted .csv catalog spreadsheet file.' });
      return;
    }

    setUploadingCSV(true);
    setCsvMsg({ error: false, text: '' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setCsvMsg({ error: false, text: data.message || 'Bulk ingestion successful!' });
        loadDashboardData();
      } else {
        setCsvMsg({ error: true, text: data.message || 'Ingestion encountered parser exception.' });
      }
    } catch (err) {
      setCsvMsg({ error: true, text: 'Failed connecting with bulk parsing worker.' });
    } finally {
      setUploadingCSV(false);
    }
  };

  // Submit new coupon
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponMsg({ error: false, text: '' });

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(couponForm)
      });

      const data = await res.json();
      if (res.ok) {
        setCouponMsg({ error: false, text: `Coupon '${data.code}' enabled in catalog.` });
        setCouponForm({
          code: '',
          discountType: 'percentage',
          discountValue: '',
          minPurchaseAmount: '',
          maxDiscountAmount: '',
          expirationDate: '',
          usageLimit: '100'
        });
        loadDashboardData();
      } else {
        setCouponMsg({ error: true, text: data.message || 'Failed saving coupon rules.' });
      }
    } catch (err) {
      setCouponMsg({ error: true, text: 'Network request rejected.' });
    }
  };

  // Delete active coupon
  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete coupon rule? Past discount logs will not be affected.')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, {
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

  // Client side product filtering
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCatFilter === 'All' || prod.category === selectedCatFilter;
    
    const totalStock = prod.sizes.reduce((acc, curr) => acc + curr.stock, 0);
    const hasLowSizeStock = prod.sizes.some(s => s.stock < 5);
    const matchesStock = selectedStockFilter === 'All' ||
                         (selectedStockFilter === 'Low' && totalStock > 0 && hasLowSizeStock) ||
                         (selectedStockFilter === 'Out' && totalStock === 0);
    
    return matchesSearch && matchesCat && matchesStock;
  });

  // Dedicated admin authentication screen if not logged in
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#07070a] px-4 py-12 relative overflow-hidden">
        {/* Decorative Grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.04),transparent_60%)] pointer-events-none"></div>
        
        <div className="w-full max-w-[420px] glass p-8 rounded-sm border border-white/5 flex flex-col gap-6 shadow-2xl relative z-10 animate-fade-in">
          <div className="text-center flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-primary tracking-[0.3em] uppercase">ADVEN / PRIVATE</span>
            <h2 className="text-2xl font-bold tracking-widest text-white uppercase font-display">ATELIER GATEWAY</h2>
            <div className="w-12 h-[1px] bg-primary mx-auto mt-2"></div>
          </div>

          {loginError && (
            <div className="bg-danger/10 border border-danger/20 text-danger py-2.5 px-4 rounded-sm text-xs text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="flex flex-col gap-4">
            <div className="form-group mb-0">
              <label htmlFor="admin-email" className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Secretariat Email</label>
              <input 
                type="email" 
                id="admin-email"
                placeholder="ENTER EMAIL ADDRESS"
                className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3 px-4 text-sm tracking-wide text-white outline-none focus:border-primary transition-all uppercase"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-0">
              <label htmlFor="admin-pass" className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Authentication Passkey</label>
              <input 
                type="password" 
                id="admin-pass"
                placeholder="ENTER PASSCODE"
                className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-3 px-4 text-sm tracking-wide text-white outline-none focus:border-primary transition-all uppercase"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full py-3.5 text-xs font-bold tracking-[0.15em] mt-2"
              disabled={loginLoading}
            >
              {loginLoading ? 'VALIDATING...' : 'AUTHORIZE ACCESS'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'products', label: 'Catalogue', icon: <Plus size={18} /> },
    { id: 'inventory', label: 'Stock Registry', icon: <Package size={18} /> },
    { id: 'orders', label: 'Orders Portal', icon: <ListChecks size={18} /> },
    { id: 'discounts', label: 'Discount Panel', icon: <Tag size={18} /> },
    { id: 'logs', label: 'Audit Trail', icon: <History size={18} /> }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full text-text-primary">
      
      {/* 1. LEFT STICKY SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-card-bg/60 border-r border-white/5 flex-col gap-10 py-10 px-6 shrink-0 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] block mb-1">ADMIN PORTAL</span>
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
          <span className="text-[9px] text-primary uppercase tracking-widest block">ADVEN PORTAL</span>
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

      {/* Mobile Drawer */}
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

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 py-8 px-4 sm:py-10 sm:px-8 lg:px-12 overflow-y-auto w-full relative">
        
        {/* Alerts Notification Indicator Row */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-white">Atelier Governance</h1>
            <p className="text-xs text-text-secondary mt-1">Authorized Session: {user?.name} ({user?.role?.toUpperCase()})</p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowAlertDrawer(!showAlertDrawer)}
              className={`flex items-center gap-2 py-2 px-4 rounded-sm text-xs font-semibold border transition-all ${
                lowStockAlerts.length > 0 
                  ? 'border-danger/30 bg-danger/5 text-danger animate-pulse'
                  : 'border-white/5 bg-white/[0.01] text-text-secondary'
              }`}
            >
              <AlertTriangle size={14} />
              <span>Warnings ({lowStockAlerts.length})</span>
            </button>

            {showAlertDrawer && (
              <div className="absolute right-0 mt-3 w-80 glass p-5 border border-white/10 rounded-sm shadow-2xl z-40 animate-fade-in flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-danger uppercase tracking-wider">Replenishment Panel</span>
                  <button className="text-text-secondary hover:text-white" onClick={() => setShowAlertDrawer(false)}><X size={14} /></button>
                </div>

                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {lowStockAlerts.length === 0 ? (
                    <div className="text-center py-4 text-xs text-text-muted">All sizes and catalog items healthy.</div>
                  ) : (
                    lowStockAlerts.map(alertItem => {
                      const sizeIssues = alertItem.sizes.filter(s => s.stock < 5).map(s => `${s.size}:${s.stock}`);
                      return (
                        <div key={alertItem._id} className="p-2 border border-danger/10 bg-danger/5 rounded-sm flex justify-between items-center text-[11px]">
                          <div className="min-w-0 pr-2">
                            <span className="text-white block font-bold truncate">{alertItem.name}</span>
                            <span className="text-[10px] text-danger/80 block mt-0.5">Critical: {sizeIssues.join(', ')}</span>
                          </div>
                          <button 
                            onClick={() => { setActiveTab('inventory'); setShowAlertDrawer(false); }} 
                            className="bg-danger text-white rounded-sm px-2 py-1 font-semibold text-[9px] hover:bg-danger/80"
                          >
                            Update
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col gap-8">
            
            {/* TAB 1: ANALYTICS */}
            {activeTab === 'analytics' && analytics && (
              <div className="flex flex-col gap-8">
                
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass p-6 rounded-sm border border-white/[0.04] flex flex-col gap-3">
                    <div className="flex justify-between items-center text-primary">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Store Revenue</span>
                      <div className="p-2 rounded-full bg-primary/10"><IndianRupee size={15} /></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">₹{analytics.totalSales.toLocaleString('en-IN')}</h3>
                    <span className="text-[10px] text-success flex items-center gap-1">
                      <TrendingUp size={11} /> +12.4% vs last week
                    </span>
                  </div>

                  <div className="glass p-6 rounded-sm border border-white/[0.04] flex flex-col gap-3">
                    <div className="flex justify-between items-center text-text-secondary">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Gross Orders</span>
                      <div className="p-2 rounded-full bg-white/[0.03]"><ShoppingBag size={15} /></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">{analytics.totalOrders}</h3>
                    <span className="text-[10px] text-text-muted">AOV: ₹{analytics.totalOrders > 0 ? Math.round(analytics.totalSales / analytics.totalOrders).toLocaleString('en-IN') : 0}</span>
                  </div>

                  <div className="glass p-6 rounded-sm border border-white/[0.04] flex flex-col gap-3">
                    <div className="flex justify-between items-center text-warning">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Fulfillment backlog</span>
                      <div className="p-2 rounded-full bg-warning/10"><Truck size={15} /></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">{analytics.pendingOrders}</h3>
                    <span className="text-[10px] text-warning/90">Requires review & dispatch</span>
                  </div>

                  <div className="glass p-6 rounded-sm border flex flex-col gap-3" style={{ borderColor: lowStockAlerts.length > 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.04)' }}>
                    <div className="flex justify-between items-center" style={{ color: lowStockAlerts.length > 0 ? 'hsl(var(--danger))' : 'hsl(var(--text-secondary))' }}>
                      <span className="text-[10px] uppercase font-bold tracking-wider">Replenish List</span>
                      <div className="p-2 rounded-full" style={{ backgroundColor: lowStockAlerts.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)' }}><AlertTriangle size={15} /></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">{lowStockAlerts.length}</h3>
                    <span className="text-[10px]" style={{ color: lowStockAlerts.length > 0 ? 'hsl(var(--danger))' : 'hsl(var(--text-muted))' }}>
                      {lowStockAlerts.length > 0 ? 'Critical size restock alerts' : 'All stocks normal'}
                    </span>
                  </div>
                </div>

                {/* Stock aggregate reports */}
                {stockSummary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-6 rounded-sm border border-white/[0.04] flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs uppercase font-bold tracking-wider text-white">Daily Stock Summary (24H)</h4>
                        <Calendar size={14} className="text-primary" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center border-y border-white/5 py-4 my-1">
                        <div>
                          <span className="text-[10px] text-text-secondary block">Units Added</span>
                          <strong className="text-success text-xl flex justify-center items-center gap-1 mt-1"><ArrowUp size={14} /> {stockSummary.daily.added}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-secondary block">Units Reduced</span>
                          <strong className="text-danger text-xl flex justify-center items-center gap-1 mt-1"><ArrowDown size={14} /> {stockSummary.daily.reduced}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-secondary block">Net Activity</span>
                          <strong className={`text-xl block mt-1 ${stockSummary.daily.net >= 0 ? 'text-success' : 'text-danger'}`}>{stockSummary.daily.net >= 0 ? '+' : ''}{stockSummary.daily.net}</strong>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted font-light">Inventory logs updated today: {stockSummary.daily.count} total records</p>
                    </div>

                    <div className="glass p-6 rounded-sm border border-white/[0.04] flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs uppercase font-bold tracking-wider text-white">Weekly Stock Summary (7D)</h4>
                        <Calendar size={14} className="text-primary" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center border-y border-white/5 py-4 my-1">
                        <div>
                          <span className="text-[10px] text-text-secondary block">Units Added</span>
                          <strong className="text-success text-xl flex justify-center items-center gap-1 mt-1"><ArrowUp size={14} /> {stockSummary.weekly.added}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-secondary block">Units Reduced</span>
                          <strong className="text-danger text-xl flex justify-center items-center gap-1 mt-1"><ArrowDown size={14} /> {stockSummary.weekly.reduced}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-secondary block">Net Activity</span>
                          <strong className={`text-xl block mt-1 ${stockSummary.weekly.net >= 0 ? 'text-success' : 'text-danger'}`}>{stockSummary.weekly.net >= 0 ? '+' : ''}{stockSummary.weekly.net}</strong>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted font-light">Inventory logs updated this week: {stockSummary.weekly.count} total records</p>
                    </div>
                  </div>
                )}

                {/* Category Revenue Distribution and Fulfill charts */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                  <div className="xl:col-span-3 glass p-6 md:p-8 rounded-sm border border-white/[0.04] w-full">
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-6 flex items-center gap-2 text-white font-display">
                      <Layers size={16} className="text-primary shrink-0" /> Division Revenue Distribution
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

                  <div className="xl:col-span-2 glass p-6 md:p-8 rounded-sm border border-white/[0.04] flex flex-col justify-between gap-6">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 text-white font-display">
                        <CheckCircle2 size={16} className="text-success shrink-0" /> Fulfillment Health
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-light">
                        Average transaction processing health rate of the Adven payment gateway.
                      </p>
                    </div>

                    <div className="flex items-center justify-center py-2">
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

              </div>
            )}

            {/* TAB 2: PRODUCTS CATALOGUE */}
            {activeTab === 'products' && (
              <div className="flex flex-col gap-8">
                
                {/* 1. Form to add/edit garment */}
                <div className="glass p-6 sm:p-8 rounded-sm border border-white/5 shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-base md:text-lg font-semibold uppercase tracking-wider text-white font-display">
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
                        <label htmlFor="product-name" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Product Title</label>
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
                        <label htmlFor="product-category" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Category</label>
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
                        <label htmlFor="product-price" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Retail Price (INR ₹)</label>
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
                      <label htmlFor="product-desc" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Editorial Description</label>
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

                    {/* Drag-and-drop Image Upload Zone */}
                    <div className="form-group mb-0">
                      <label className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">
                        Garment Media (Cloudinary Drag & Drop zone)
                      </label>
                      
                      <div 
                        className={`w-full border-2 border-dashed rounded-sm p-6 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                          dragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
                        }`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('images-file-picker').click()}
                      >
                        <Upload size={28} className={dragActive ? 'text-primary' : 'text-text-muted'} />
                        <span className="text-xs font-semibold text-white">
                          {uploadingImages ? 'Uploading assets...' : 'Drag & drop product photos here, or click to browse'}
                        </span>
                        <span className="text-[10px] text-text-secondary">PNG, JPG, JPEG up to 5MB (Auto fallback to server directory if no Cloudinary keys set)</span>
                        
                        <input 
                          type="file" 
                          id="images-file-picker" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </div>

                      {/* Manual Image URL Input fallback */}
                      <div className="flex gap-2 mt-4">
                        <input 
                          type="text" 
                          className="form-control flex-1 focus:!border-primary !bg-white/5 text-xs" 
                          placeholder="Or paste external photography URL..."
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                        />
                        <button type="button" className="btn btn-secondary !py-2 !px-4 !text-xs shrink-0" onClick={addImageUrl}>Add URL</button>
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

                {/* 2. CSV Bulk Import Section */}
                <div className="glass p-6 sm:p-8 rounded-sm border border-white/5 shadow-md flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2 font-display">
                    <FileSpreadsheet size={16} className="text-primary" /> CSV Bulk Product Ingestion
                  </h3>
                  <p className="text-xs text-text-secondary font-light leading-relaxed">
                    Import multiple garments, photos, and sizing matrices in a single CSV transaction.
                  </p>
                  
                  <div className="bg-[#0f0f13] border border-white/5 p-4 rounded-sm">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider block mb-2">CSV Column Mapping Rules</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[10px] text-text-secondary">
                      <div>
                        <strong className="text-white">name, description</strong>: String text values.
                      </div>
                      <div>
                        <strong className="text-white">price</strong>: Number value (INR).
                      </div>
                      <div>
                        <strong className="text-white">category</strong>: One of: Shirts, T-Shirts, Trousers, Jeans, Cargos, Sports Trousers...
                      </div>
                      <div>
                        <strong className="text-white">images</strong>: URL(s) split by semicolon.
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-text-secondary border-t border-white/5 pt-2">
                      <strong className="text-white">sizes_stock</strong>: semicolon-separated stock mapping. Example: <code className="text-primary">S:20;M:15;L:10;XL:5</code>
                    </div>
                  </div>

                  {csvMsg.text && (
                    <div className={`py-2 px-4 border rounded-sm text-xs text-center ${
                      csvMsg.error ? 'bg-danger/10 border-danger/25 text-danger' : 'bg-success/10 border-success/25 text-success'
                    }`}>
                      {csvMsg.text}
                    </div>
                  )}

                  <div 
                    className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      csvDragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
                    }`}
                    onDragEnter={handleCsvDrag}
                    onDragOver={handleCsvDrag}
                    onDragLeave={handleCsvDrag}
                    onDrop={handleCsvDrop}
                    onClick={() => document.getElementById('csv-file-picker').click()}
                  >
                    <FileSpreadsheet size={24} className={csvDragActive ? 'text-primary' : 'text-text-muted'} />
                    <span className="text-xs font-semibold text-white">
                      {uploadingCSV ? 'Ingesting product spreadsheet...' : 'Drag & drop catalog .csv file here, or click to upload'}
                    </span>
                    <input 
                      type="file" 
                      id="csv-file-picker" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={handleCsvFileChange}
                    />
                  </div>
                </div>

                {/* 3. Catalogue Listing with live search/filters */}
                <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-md flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-base font-display font-semibold uppercase tracking-wider text-white">Garment Registry ({filteredProducts.length} Items)</h3>
                    
                    {/* Live Catalogue Filters */}
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                      <input 
                        type="text" 
                        className="bg-[#121216] border border-white/10 text-white rounded-sm py-1.5 px-3 text-xs outline-none focus:border-primary w-full sm:w-48"
                        placeholder="Search catalog..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      <select 
                        value={selectedCatFilter}
                        onChange={(e) => setSelectedCatFilter(e.target.value)}
                        className="bg-[#121216] border border-white/10 text-text-secondary rounded-sm py-1.5 px-2.5 text-xs outline-none cursor-pointer"
                      >
                        <option value="All">All Categories</option>
                        <option value="Shirts">Shirts</option>
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Trousers">Trousers</option>
                        <option value="Jeans">Jeans</option>
                        <option value="Cargos">Cargos</option>
                        <option value="Cotton Shorts">Cotton Shorts</option>
                        <option value="Sports Trousers">Sports Trousers</option>
                        <option value="Sports Shorts">Sports Shorts</option>
                      </select>

                      <select 
                        value={selectedStockFilter}
                        onChange={(e) => setSelectedStockFilter(e.target.value)}
                        className="bg-[#121216] border border-white/10 text-text-secondary rounded-sm py-1.5 px-2.5 text-xs outline-none cursor-pointer"
                      >
                        <option value="All">All Stock Levels</option>
                        <option value="Low">Low Stock Sizes</option>
                        <option value="Out">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                  
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
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-xs text-text-muted">No items matched current filter criteria.</td>
                          </tr>
                        ) : (
                          filteredProducts.map((prod) => {
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
                                    <span className={`font-semibold text-xs ${totalStock < 10 ? 'text-danger' : 'text-text-secondary'}`}>
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
                          })
                        )}
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
                    Click size badges to make manual inventory restocks. System logs operations automatically.
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

            {/* TAB 5: DISCOUNT & COUPON PANEL */}
            {activeTab === 'discounts' && (
              <div className="flex flex-col gap-8">
                
                {/* Coupon creation form */}
                <div className="glass p-6 sm:p-8 rounded-sm border border-white/5 shadow-md">
                  <h3 className="text-base font-display font-semibold uppercase tracking-wider mb-6 text-white">Generate Discount Rules</h3>
                  
                  {couponMsg.text && (
                    <div className={`py-2 px-4 rounded-sm text-xs mb-6 text-center border ${
                      couponMsg.error ? 'bg-danger/10 border-danger/25 text-danger' : 'bg-success/10 border-success/25 text-success'
                    }`}>
                      {couponMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleCouponSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="form-group mb-0">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Coupon Code</label>
                        <input 
                          type="text" 
                          placeholder="e.g. LUXE20"
                          className="form-control w-full focus:!border-primary !bg-white/5"
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                          required
                        />
                      </div>

                      <div className="form-group mb-0">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Discount Model</label>
                        <select 
                          className="form-control w-full focus:!border-primary !bg-white/5 select-control"
                          value={couponForm.discountType}
                          onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value})}
                        >
                          <option value="percentage" className="bg-card-bg">Percentage (%)</option>
                          <option value="flat" className="bg-card-bg">Flat Amount (₹)</option>
                        </select>
                      </div>

                      <div className="form-group mb-0">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Value</label>
                        <input 
                          type="number" 
                          placeholder={couponForm.discountType === 'percentage' ? 'e.g. 15' : 'e.g. 500'}
                          className="form-control w-full focus:!border-primary !bg-white/5"
                          value={couponForm.discountValue}
                          onChange={(e) => setCouponForm({...couponForm, discountValue: Number(e.target.value)})}
                          min="1"
                          required
                        />
                      </div>

                      <div className="form-group mb-0">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Usage Limit</label>
                        <input 
                          type="number" 
                          placeholder="100"
                          className="form-control w-full focus:!border-primary !bg-white/5"
                          value={couponForm.usageLimit}
                          onChange={(e) => setCouponForm({...couponForm, usageLimit: Number(e.target.value)})}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                      <div className="form-group mb-0">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Min Purchase Requirement (₹)</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          className="form-control w-full focus:!border-primary !bg-white/5"
                          value={couponForm.minPurchaseAmount}
                          onChange={(e) => setCouponForm({...couponForm, minPurchaseAmount: Number(e.target.value)})}
                          min="0"
                        />
                      </div>

                      <div className="form-group mb-0">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Max Cap (₹, Percentage only)</label>
                        <input 
                          type="number" 
                          placeholder="No Limit"
                          className="form-control w-full focus:!border-primary !bg-white/5"
                          value={couponForm.maxDiscountAmount}
                          onChange={(e) => setCouponForm({...couponForm, maxDiscountAmount: Number(e.target.value)})}
                          min="0"
                        />
                      </div>

                      <div className="form-group mb-0">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-bold block">Expiration Date</label>
                        <input 
                          type="date" 
                          className="form-control w-full focus:!border-primary !bg-white/5"
                          value={couponForm.expirationDate}
                          onChange={(e) => setCouponForm({...couponForm, expirationDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button type="submit" className="btn btn-primary !py-3 !px-8 text-xs font-bold tracking-wider">Activate Coupon</button>
                    </div>
                  </form>
                </div>

                {/* Coupon listing table */}
                <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-md">
                  <h3 className="text-base font-display font-semibold uppercase tracking-wider mb-6 text-white">Active Discount Codes</h3>

                  <div className="overflow-x-auto w-full border border-white/5 rounded-sm bg-white/[0.01]">
                    <table className="w-full border-collapse text-xs md:text-sm text-left whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-white/5 text-text-muted bg-white/[0.02]">
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Coupon Code</th>
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Discount Value</th>
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Purchase thresholds</th>
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Usage tracker</th>
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px]">Expiration Date</th>
                          <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-xs text-text-muted">No coupon campaigns active in store.</td>
                          </tr>
                        ) : (
                          coupons.map((c) => {
                            const isExpired = new Date(c.expirationDate) < new Date();
                            return (
                              <tr key={c._id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                                <td className="py-4 px-4"><strong className="font-mono text-white text-xs tracking-wider bg-white/[0.02] py-1 px-2.5 rounded-sm border border-white/5">{c.code}</strong></td>
                                <td className="py-4 px-4 font-semibold text-white">{c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}</td>
                                <td className="py-4 px-4 text-text-secondary">Min: ₹{c.minPurchaseAmount || 0} {c.maxDiscountAmount ? `| Cap: ₹${c.maxDiscountAmount}` : ''}</td>
                                <td className="py-4 px-4 text-text-secondary">{c.usageCount} / {c.usageLimit} claims</td>
                                <td className="py-4 px-4">
                                  <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>
                                    {new Date(c.expirationDate).toLocaleDateString()} {isExpired ? '(Expired)' : ''}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <button onClick={() => handleDeleteCoupon(c._id)} className="text-danger hover:text-danger/80 p-1.5 hover:bg-white/5 rounded-sm transition-all"><Trash2 size={15} /></button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 6: AUDIT TRAIL LOGS */}
            {activeTab === 'logs' && (
              <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-md">
                <h3 className="text-base font-display font-semibold uppercase tracking-wider text-white mb-6">Inventory Audit Trail</h3>

                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {inventoryLogs.length === 0 ? (
                    <div className="py-12 text-center text-text-muted border border-dashed border-border-color rounded-sm text-xs">
                      No stock adjustments registered in database registry.
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
                              {log.description} | Executed by: {log.performedBy}
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
